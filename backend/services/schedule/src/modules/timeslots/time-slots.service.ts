import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { TimeSlot, Status } from './entities/time-slot.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TimeSlotsService {
    constructor(
        @InjectRepository(TimeSlot) private readonly timeSlotRepository: Repository<TimeSlot>,
        private dataSource: DataSource,
        @Inject('LOG_SERVICE') private logClient: ClientProxy,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
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
        const { doctorIds, date, startTime, endTime, clinicType } = data;

        const timeSlots = await this.timeSlotRepository.find({
            where: {
                doctorId: In(doctorIds),
                clinicDate: new Date(date),
                startTime: Between(startTime, endTime),
                status: Status.AVAILABLE,
                clinicType: clinicType
            },
            order: { startTime: 'ASC' }
        });

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

    @Cron(CronExpression.EVERY_WEEK)
    async scheduling() {
        const lockId = randomUUID();

        this.processLog('Scheduling', 'system', `Bắt đầu lên lịch khám cho tuần sau, mã khóa ${lockId}`);

        await this.cacheManager.set('Lock:Scheduling', lockId, 600000);

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

        } catch (e) {
            await queryRunner.rollbackTransaction();

            this.processLog('Scheduling', 'system', `Lỗi khi lên lịch khám cho tuần sau, mã khóa ${lockId}, lỗi ${e}`, 'error');
        } finally {
            await queryRunner.release();

            if ((await this.cacheManager.get('Lock:Scheduling')) == lockId) {
                await this.cacheManager.del('Lock:Scheduling');
            }

            this.processLog('Scheduling', 'system', `Kết thúc lên lịch khám cho tuần sau, mã khóa ${lockId}`);
        }
    }
}
