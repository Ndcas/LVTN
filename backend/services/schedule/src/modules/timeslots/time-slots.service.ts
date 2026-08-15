import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, QueryRunner, Repository } from 'typeorm';
import { TimeSlot, Status as TimeSlotStatus } from './entities/time-slot.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { GlobalHoliday } from '../holidays/entities/global-holiday.entity';
import { DoctorLeave, Status as DoctorLeaveStatus } from '../leaves/entities/doctor-leave.entity';
import { DoctorWeeklyTemplate } from '../templates/entities/doctor-weekly-template.entity';

@Injectable()
export class TimeSlotsService {
    constructor(
        @InjectRepository(TimeSlot) private timeSlotRepository: Repository<TimeSlot>,
        private dataSource: DataSource,
        @Inject('LOG_SERVICE') private logClient: ClientProxy,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private configService: ConfigService
    ) { }

    private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
        this.logClient.emit('system_log', {
            level: level,
            message: `${action} ${info}`,
            service: 'schedule_service',
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        });
    }

    async getAvailableTimeSlots(data: any) {
        const { doctorIds, date, clinicType } = data;
        const now = new Date();
        const nowStr = this.dateToYYYYMMDD(now);

        if (date < nowStr) {
            return {
                ok: false,
                status: 400,
                error: 'Không thể đặt lịch khám trong quá khứ',
            };
        }

        let timeSlots = await this.timeSlotRepository.find({
            where: {
                doctorId: In(doctorIds),
                clinicDate: date,
                status: TimeSlotStatus.AVAILABLE,
                clinicType
            },
            order: { startTime: 'ASC' }
        });

        if (date == nowStr) {
            timeSlots = timeSlots.filter(ts => this.timeToSeconds(ts.startTime) > (now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds());
        }

        const result = timeSlots.map(ts => ({
            id: ts.id,
            doctorId: ts.doctorId,
            startTime: ts.startTime,
            endTime: ts.endTime
        }));

        return {
            ok: true,
            status: 200,
            data: result
        };
    }

    async getTodayAppointmentsCount(data: any) {
        const today = this.dateToYYYYMMDD(new Date());
        const count = await this.timeSlotRepository.count({
            where: {
                clinicDate: today,
                status: TimeSlotStatus.BOOKED
            }
        });

        return {
            ok: true,
            status: 200,
            count
        }
    }

    @Cron(CronExpression.EVERY_WEEK)
    async scheduleTimeSlots() {
        const queryRunner = this.dataSource.createQueryRunner();
        const lockId = randomUUID();

        try {
            if (await this.cacheManager.get('Lock:Scheduling')) {
                this.processLog('ScheduleTimeSlots', 'system', `Đã có tiến trình đang chạy`, 'warn');

                return;
            }

            this.processLog('ScheduleTimeSlots', 'system', `Bắt đầu lên lịch khám cho đến chủ nhật kế tiếp, mã khóa: ${lockId}`);

            await this.cacheManager.set('Lock:Scheduling', lockId, 600000);

            await queryRunner.connect();

            await queryRunner.startTransaction();

            const today = new Date();
            const maxExistedDate = (await queryRunner
                .manager
                .getRepository(TimeSlot)
                .createQueryBuilder('time_slot')
                .select('MAX(time_slot.clinic_date)', 'maxDate')
                .setLock('pessimistic_read')
                .getRawOne())?.maxDate;
            const yesterdayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            let maxDate: Date;

            if (maxExistedDate) {
                maxDate = new Date(maxExistedDate);
            } else {
                maxDate = yesterdayDate;
            }

            if (maxDate < yesterdayDate) {
                maxDate = yesterdayDate;
            }

            const nextSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7 - today.getDay());

            if (maxDate >= nextSunday) {
                await queryRunner.commitTransaction();

                return;
            }

            const dates = new Set<string>();
            const currentDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate() + 1);

            while (currentDate <= nextSunday) {
                dates.add(this.dateToYYYYMMDD(currentDate));

                currentDate.setDate(currentDate.getDate() + 1);
            }

            const startDate = this.dateToYYYYMMDD(new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate() + 1));
            const endDate = this.dateToYYYYMMDD(nextSunday);
            const holidays = await queryRunner.manager.getRepository(GlobalHoliday).find({
                where: { holidayDate: Between(startDate, endDate) },
                lock: { mode: 'pessimistic_read' }
            });

            for (const holiday of holidays) {
                if (dates.has(holiday.holidayDate)) {
                    dates.delete(holiday.holidayDate);
                }
            }

            const doctorWeeklyTemplates = await queryRunner.manager.getRepository(DoctorWeeklyTemplate).find({
                lock: { mode: 'pessimistic_read' }
            });
            const doctorWeeklyTemplateMap = new Map();

            for (const doctorWeeklyTemplate of doctorWeeklyTemplates) {
                if (!doctorWeeklyTemplateMap.has(doctorWeeklyTemplate.dayOfWeek)) {
                    doctorWeeklyTemplateMap.set(doctorWeeklyTemplate.dayOfWeek, new Map());
                }

                const dayOfWeekMap = doctorWeeklyTemplateMap.get(doctorWeeklyTemplate.dayOfWeek);

                if (!dayOfWeekMap.has(doctorWeeklyTemplate.doctorId)) {
                    dayOfWeekMap.set(doctorWeeklyTemplate.doctorId, []);
                }

                dayOfWeekMap.get(doctorWeeklyTemplate.doctorId).push({
                    startTime: this.timeToSeconds(doctorWeeklyTemplate.startTime),
                    endTime: this.timeToSeconds(doctorWeeklyTemplate.endTime),
                    clinicType: doctorWeeklyTemplate.clinicType
                });
            }

            const doctorLeaves = await queryRunner.manager.getRepository(DoctorLeave).find({
                where: {
                    leaveDate: Between(startDate, endDate),
                    status: DoctorLeaveStatus.APPROVED
                },
                lock: { mode: 'pessimistic_read' }
            });
            const doctorLeaveMap = new Map();

            for (const doctorLeave of doctorLeaves) {
                if (!doctorLeaveMap.has(doctorLeave.doctorId)) {
                    doctorLeaveMap.set(doctorLeave.doctorId, new Set());
                }

                doctorLeaveMap.get(doctorLeave.doctorId).add(doctorLeave.leaveDate);
            }

            const timePerSlot = this.configService.get<number>('TIME_SLOT_DURATION_MIN')! * 60;
            const timeSlots: TimeSlot[] = [];

            for (const date of dates) {
                const dayOfWeek = new Date(date).getDay();

                if (!doctorWeeklyTemplateMap.has(dayOfWeek)) {
                    continue;
                }

                const dayOfWeekMap = doctorWeeklyTemplateMap.get(dayOfWeek);

                for (const [doctorId, templates] of dayOfWeekMap.entries()) {
                    if (doctorLeaveMap.has(doctorId) && doctorLeaveMap.get(doctorId).has(date)) {
                        continue;
                    }

                    for (const template of templates) {
                        for (let i = template.startTime; i + timePerSlot <= template.endTime; i += timePerSlot) {
                            timeSlots.push(queryRunner.manager.create(TimeSlot, {
                                doctorId,
                                clinicDate: date,
                                startTime: this.secondsToTime(i),
                                endTime: this.secondsToTime(i + timePerSlot),
                                clinicType: template.clinicType,
                                status: TimeSlotStatus.AVAILABLE
                            }));
                        }
                    }
                }
            }

            await queryRunner.manager.save(TimeSlot, timeSlots);

            if ((await this.cacheManager.get('Lock:Scheduling')) != lockId) {
                throw new Error('Invalid lock');
            }

            await queryRunner.commitTransaction();

            this.processLog('ScheduleTimeSlots', 'system', `Lên lịch thành công, mã khóa: ${lockId}`);
        } catch (e) {
            queryRunner.rollbackTransaction().catch(e => { });

            this.processLog('ScheduleTimeSlots', 'system', `Lỗi khi lên lịch, mã khóa: ${lockId}, lỗi: ${e}`, 'error');
        } finally {
            queryRunner.release().catch(e => { });

            try {
                if ((await this.cacheManager.get('Lock:Scheduling')) == lockId) {
                    await this.cacheManager.del('Lock:Scheduling');
                }
            } catch (e) { }
        }
    }

    @Cron('0 1 * * *')
    async deleteOldTimeSlots() {
        this.processLog('DeleteOldTimeSlots', 'system', `Xóa lịch cũ bắt đầu`);

        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();

            await queryRunner.startTransaction();

            await queryRunner.manager.query(`
                UPDATE bookings b
                INNER JOIN time_slots ts ON b.time_slot_id = ts.id
                SET b.status = 'CANCELED'
                WHERE ts.clinic_date < CURDATE() AND b.status = 'CONFIRMED'
            `);

            await queryRunner.manager.query(`
                DELETE ts
                FROM time_slots ts
                LEFT JOIN bookings b ON b.time_slot_id = ts.id
                WHERE ts.clinic_date < CURDATE() AND ts.status = 'AVAILABLE' AND b.id IS NULL
            `);

            await queryRunner.commitTransaction();

            this.processLog('DeleteOldTimeSlots', 'system', `Xóa lịch cũ thành công`);
        } catch (e) {
            queryRunner.rollbackTransaction().catch(e => { });

            this.processLog('DeleteOldTimeSlots', 'system', `Lỗi khi xóa lịch cũ, lỗi: ${e}`, 'error');
        } finally {
            queryRunner.release().catch(e => { });
        }
    }

    private dateToYYYYMMDD(date: Date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    private timeToSeconds(time: string) {
        const [hours, minutes, seconds] = time.split(':').map(Number);

        return hours * 3600 + minutes * 60 + seconds;
    }

    private secondsToTime(totalSeconds: number) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }
}
