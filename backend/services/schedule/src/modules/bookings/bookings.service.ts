import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking, Status as BookingStatus } from './entities/booking.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Status as TimeSlotStatus, TimeSlot } from '../timeslots/entities/time-slot.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
        private dataSource: DataSource
    ) { }

    async getAll(data: any) {
        const { page = 1, limit = 10, patientId, status } = data;
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
            ])
            .andWhere('booking.patientId = :patientId', { patientId });

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

        const { timeSlotId, patientId } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
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

            const booking = this.bookingRepository.create({
                timeSlotId,
                patientId,
                status: BookingStatus.CONFIRMED
            });

            await queryRunner.manager.save(booking);

            timeSlot.status = TimeSlotStatus.BOOKED;

            await queryRunner.manager.save(timeSlot);

            await queryRunner.commitTransaction();

            this.notificationClient.emit('booking_created', {
                correlationId: data.correlationId,
                doctorId: timeSlot.doctorId
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

            booking.status = status;

            await queryRunner.manager.save(booking);

            if (status == BookingStatus.CANCELED) {
                const timeSlot = booking.timeSlot;

                timeSlot.status = TimeSlotStatus.AVAILABLE;

                await queryRunner.manager.save(timeSlot);
            }

            await queryRunner.commitTransaction();

            if (status == BookingStatus.CANCELED) {
                if (userId == booking.patientId) {
                    this.notificationClient.emit('booking_canceled_by_patient', {
                        correlationId,
                        doctorId: booking.timeSlot.doctorId
                    });
                } else if (userId == booking.timeSlot.doctorId) {
                    this.notificationClient.emit('booking_canceled_by_doctor', {
                        correlationId,
                        patientId: booking.patientId
                    });
                }
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
}
