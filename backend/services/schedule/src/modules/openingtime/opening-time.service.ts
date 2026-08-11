import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OpeningTime } from './entities/opening-time.entity';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OpeningTimeService {
    constructor(
        @InjectRepository(OpeningTime) private openingTimeRepository: Repository<OpeningTime>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('LOG_SERVICE') private logClient: ClientProxy
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

    async getOpeningTime(data: any) {
        try {
            const cacheData = await this.cacheManager.get('openingTime');

            if (cacheData) {
                return {
                    ok: true,
                    status: 200,
                    message: 'Lấy danh sách thời gian mở cửa thành công',
                    data: cacheData
                };
            }
        } catch (error) {
            this.processLog('GetOpeningTime', data.correlationId, `Lỗi khi lấy danh sách thời gian mở cửa từ cache: ${error}`, 'warn');
        }

        const openingTimes = await this.openingTimeRepository.find();
        const responseData = openingTimes.map(ot => ({
            dayOfWeek: ot.dayOfWeek,
            startTime: ot.startTime,
            endTime: ot.endTime
        }));

        this.cacheManager.set('openingTime', responseData, 1800000).catch(e => {
            this.processLog('GetOpeningTime', data.correlationId, `Lỗi khi lưu danh sách thời gian mở cửa vào cache: ${e}`, 'warn');
        });

        return {
            ok: true,
            status: 200,
            message: 'Lấy danh sách thời gian mở cửa thành công',
            data: responseData
        };
    }
}
