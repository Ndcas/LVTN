import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { Booking, Status as BookingStatus } from './entities/booking.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Status as TimeSlotStatus, TimeSlot } from '../timeslots/entities/time-slot.entity';
import { type ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface UserServiceClient {
    getDoctorExaminationFee(data: any): Observable<any>;
}

interface MedicalRecordServiceClient {
    createRecord(data: any): Observable<any>;
    deleteRecord(data: any): Observable<any>;
}

interface PaymentServiceClient {
    createInvoice(data: any): Observable<any>;
    deleteInvoice(data: any): Observable<any>;
    getUnpaidInvoicesCount(data: any): Observable<any>;
}

@Injectable()
export class BookingsService implements OnModuleInit {
    private userService: UserServiceClient;
    private medicalRecordService: MedicalRecordServiceClient;
    private paymentService: PaymentServiceClient;

    constructor(
        @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
        @Inject('USER_PACKAGE') private userClient: ClientGrpc,
        @Inject('MEDICAL_RECORD_PACKAGE') private medicalRecordClient: ClientGrpc,
        @Inject('PAYMENT_PACKAGE') private paymentClient: ClientGrpc,
        private dataSource: DataSource
    ) { }

    onModuleInit() {
        this.userService = this.userClient.getService<UserServiceClient>('UserService');
        this.medicalRecordService = this.medicalRecordClient.getService<MedicalRecordServiceClient>('MedicalRecordService');
        this.paymentService = this.paymentClient.getService<PaymentServiceClient>('PaymentService');
    }

    async getAll(data: any) {
        const { page = 1, limit = 10, userId, status, roleId } = data;
        const skip = (page - 1) * limit;
        const queryBuilder = this.bookingRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.timeSlot', 'timeSlot')
            .select([
                'booking.id',
                'booking.status',
                'timeSlot.clinicDate',
                'timeSlot.clinicType',
                'timeSlot.startTime',
                'timeSlot.endTime',
                'booking.createdAt',
                'booking.updatedAt',
                'booking.patientId',
                'timeSlot.doctorId',
                'timeSlot.id'
            ]);

        if (roleId == 2) {
            queryBuilder.andWhere('timeSlot.doctorId = :doctorId', { doctorId: userId });
        } else if (roleId == 3) {
            queryBuilder.andWhere('booking.patientId = :patientId', { patientId: userId });
        }

        if (status) {
            queryBuilder.andWhere('booking.status = :status', { status });
        }

        queryBuilder.orderBy('timeSlot.clinicDate', 'DESC').addOrderBy('timeSlot.startTime', 'DESC');

        const [bookings, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

        return {
            ok: true,
            status: 200,
            data: bookings.map(booking => ({
                id: booking.id,
                status: booking.status,
                clinicDate: booking.timeSlot.clinicDate,
                clinicType: booking.timeSlot.clinicType,
                startTime: booking.timeSlot.startTime,
                endTime: booking.timeSlot.endTime,
                createdAt: booking.createdAt.toISOString(),
                updatedAt: booking.updatedAt.toISOString(),
                patientId: booking.patientId,
                doctorId: booking.timeSlot.doctorId,
                timeSlotId: booking.timeSlot.id
            })),
            total,
            page,
            limit
        };
    }

    async getById(data: any) {
        const id = data.id;

        const booking = await this.bookingRepository.findOne({
            where: { id: id },
            relations: { timeSlot: true }
        });

        if (!booking) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy lịch hẹn'
            };
        }

        return {
            ok: true,
            status: 200,
            data: {
                id: booking.id,
                status: booking.status,
                patientId: booking.patientId,
                doctorId: booking.timeSlot.doctorId,
                timeSlotId: booking.timeSlot.id,
                clinicDate: booking.timeSlot.clinicDate,
                clinicType: booking.timeSlot.clinicType,
                startTime: booking.timeSlot.startTime,
                endTime: booking.timeSlot.endTime,
                createdAt: booking.createdAt.toISOString(),
                updatedAt: booking.updatedAt.toISOString()
            }
        };
    }

    async create(data: any) {
        if (await this.cacheManager.get('Lock:Scheduling')) {
            return {
                ok: false,
                status: 409,
                error: 'Hệ thống đang bận lên lịch, vui lòng thử lại sau'
            };
        }

        const { timeSlotId, patientId, correlationId } = data;

        const unpaidCountResp: any = await lastValueFrom(this.paymentService.getUnpaidInvoicesCount({ patientId, correlationId }));

        if (!unpaidCountResp.ok) {
            return {
                ok: false,
                status: unpaidCountResp.status,
                error: unpaidCountResp.error
            };
        }

        if (unpaidCountResp.count > 0) {
            return {
                ok: false,
                status: 409,
                error: 'Bệnh nhân còn hóa đơn chưa thanh toán'
            };
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const unfinishedCount = await queryRunner.manager.find(Booking, {
                where: {
                    patientId,
                    status: BookingStatus.CONFIRMED,
                    timeSlot: { clinicDate: MoreThanOrEqual(this.getYYYMMDD()) }
                },
                relations: { timeSlot: true },
                lock: { mode: 'pessimistic_read' }
            });

            if (unfinishedCount.length >= 3) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 409,
                    error: 'Bệnh nhân chỉ có thể có tối đa 3 lịch hẹn cùng lúc'
                };
            }

            const timeSlot = await queryRunner.manager.findOne(TimeSlot, {
                where: {
                    id: timeSlotId,
                    status: TimeSlotStatus.AVAILABLE
                },
                lock: { mode: 'pessimistic_write' }
            });

            if (!timeSlot) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 409,
                    error: 'Khung giờ này đã được đặt hoặc không tồn tại'
                };
            }

            const startTime = this.getDateObject(timeSlot.clinicDate, timeSlot.startTime);

            if (startTime <= new Date()) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 409,
                    error: 'Đã quá thời gian đặt khám cho khung giờ này'
                };
            }

            const booking = this.bookingRepository.create({
                timeSlotId,
                patientId,
                status: BookingStatus.CONFIRMED
            });

            await queryRunner.manager.save(Booking, booking);

            timeSlot.status = TimeSlotStatus.BOOKED;

            await queryRunner.manager.save(TimeSlot, timeSlot);

            await queryRunner.commitTransaction();

            this.notificationClient.emit('booking_created', {
                correlationId,
                doctorId: timeSlot.doctorId,
                date: timeSlot.clinicDate,
                startTime: timeSlot.startTime,
                clinicType: timeSlot.clinicType
            });

            return {
                ok: true,
                status: 200,
                message: 'Đặt lịch thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateStatus(data: any) {
        const { bookingId, userId, status, correlationId } = data;

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const booking = await queryRunner.manager.getRepository(Booking).findOne({
                where: [{
                    id: bookingId,
                    patientId: userId,
                    status: BookingStatus.CONFIRMED
                }, {
                    id: bookingId,
                    timeSlot: { doctorId: userId },
                    status: BookingStatus.CONFIRMED
                }],
                relations: { timeSlot: true },
                lock: { mode: 'pessimistic_write' }
            });

            if (!booking) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 404,
                    error: 'Không tìm thấy lịch hẹn'
                }
            }

            if (status == BookingStatus.NO_SHOW || status == BookingStatus.FINISHED) {
                const startTime = this.getDateObject(booking.timeSlot.clinicDate, booking.timeSlot.startTime);

                if (startTime.getTime() >= Date.now()) {
                    await queryRunner.rollbackTransaction();

                    return {
                        ok: false,
                        status: 400,
                        error: 'Chưa thể cập nhật trạng thái lịch hẹn vào lúc này'
                    };
                }
            }

            booking.status = status;

            await queryRunner.manager.save(booking);

            if (status == BookingStatus.CANCELED) {
                const timeSlot = booking.timeSlot;

                timeSlot.status = TimeSlotStatus.AVAILABLE;

                await queryRunner.manager.save(timeSlot);
            }

            await queryRunner.commitTransaction();

            if (status == BookingStatus.CANCELED) {
                this.notificationClient.emit('booking_canceled', {
                    correlationId,
                    userId: booking.timeSlot.doctorId,
                    date: booking.timeSlot.clinicDate,
                    startTime: booking.timeSlot.startTime,
                    clinicType: booking.timeSlot.clinicType,
                    sourceRoleId: 3
                });
            }

            return {
                ok: true,
                status: 200,
                message: 'Cập nhật trạng thái lịch hẹn thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async finishBooking(data: any) {
        const { bookingId, doctorId, clinicalIndicators, diseaseId, diagnoseDetail, prescriptionDetails, correlationId } = data;

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const booking = await queryRunner.manager.findOne(Booking, {
                where: {
                    id: bookingId,
                    status: BookingStatus.CONFIRMED
                },
                relations: { timeSlot: true },
                lock: { mode: 'pessimistic_write' }
            });

            if (!booking) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 404,
                    error: 'Không tìm thấy hoặc không thể cập nhật lịch hẹn'
                };
            }

            const startTime = this.getDateObject(booking.timeSlot.clinicDate, booking.timeSlot.startTime);

            if (startTime.getTime() >= Date.now()) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 400,
                    error: 'Chưa thể cập nhật trạng thái lịch hẹn vào lúc này'
                };
            }

            const feeResp: any = await lastValueFrom(this.userService.getDoctorExaminationFee({
                id: doctorId,
                correlationId
            }));

            if (!feeResp.ok) {
                throw new Error(feeResp.error);
            };

            const examinationFee = feeResp.fee;
            let recordId = null;
            let medicineFee = 0;
            const recordResp: any = await lastValueFrom(this.medicalRecordService.createRecord({
                bookingId,
                patientId: booking.patientId,
                doctorId,
                visitDate: booking.timeSlot.clinicDate,
                clinicalIndicators,
                diseaseId,
                diagnoseDetail,
                prescriptionDetails,
                correlationId
            }));

            if (!recordResp.ok) {
                throw new Error(recordResp.error);
            }

            recordId = recordResp.id;
            medicineFee = recordResp.medicineFee;

            const totalAmount = examinationFee + medicineFee;
            let invoiceId = null;
            const invoiceResp: any = await lastValueFrom(this.paymentService.createInvoice({
                bookingId,
                patientId: booking.patientId,
                examinationFee,
                medicineFee,
                totalAmount,
                correlationId
            }));

            if (!invoiceResp.ok) {
                lastValueFrom(this.medicalRecordService.deleteRecord({
                    id: recordId,
                    correlationId
                })).catch(() => { });

                throw new Error(invoiceResp.error);
            }

            invoiceId = invoiceResp.id;

            try {
                booking.status = BookingStatus.FINISHED;

                await queryRunner.manager.save(Booking, booking);

                await queryRunner.commitTransaction();
            } catch (bookingError) {
                if (invoiceId) {
                    lastValueFrom(this.paymentService.deleteInvoice({ id: invoiceId, correlationId })).catch(() => { });
                }
                if (recordId) {
                    lastValueFrom(this.medicalRecordService.deleteRecord({ id: recordId, correlationId })).catch(() => { });
                }

                throw bookingError;
            }

            return {
                ok: true,
                status: 200,
                message: 'Hoàn thành ca khám thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async generateVideoCallId(data: any) {
        const { correlationId, userId, bookingId } = data;
        const booking = await this.bookingRepository.findOne({
            where: [{
                id: bookingId,
                patientId: userId
            }, {
                id: bookingId,
                timeSlot: { doctorId: userId }
            }],
            relations: { timeSlot: true }
        });

        if (!booking) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy lịch hẹn hoặc bạn không có quyền truy cập'
            };
        }

        const expireTime = this.getDateObject(booking.timeSlot.clinicDate, booking.timeSlot.endTime);
        const now = Date.now();

        if (expireTime.getTime() < now) {
            return {
                ok: false,
                status: 400,
                error: 'Đã hết giờ khám'
            };
        }

        const startTime = this.getDateObject(booking.timeSlot.clinicDate, booking.timeSlot.startTime);

        if (startTime.getTime() > now + 300000) {
            return {
                ok: false,
                status: 400,
                error: 'Chưa đến giờ khám'
            };
        }

        const callId = `Room_${bookingId}_${booking.timeSlot.doctorId}_${booking.patientId}`;

        if (booking.patientId == userId) {
            lastValueFrom(this.notificationClient.emit('video_call', {
                correlationId,
                bookingId,
                sourceRoleId: 3,
                userId: booking.timeSlot.doctorId
            })).catch((e) => { });
        } else {
            lastValueFrom(this.notificationClient.emit('video_call', {
                correlationId,
                bookingId,
                sourceRoleId: 2,
                userId: booking.patientId
            })).catch((e) => { });
        }

        return {
            ok: true,
            status: 200,
            message: 'Tạo ID cuộc gọi thành công',
            callId
        };
    }

    private getDateObject(date: string, time: string) {
        const [year, month, day] = date.split('-');
        const [h, m, s] = time.split(':');

        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(h), parseInt(m), parseInt(s));
    }

    private getYYYMMDD() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}
