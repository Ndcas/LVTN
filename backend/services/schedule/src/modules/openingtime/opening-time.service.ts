import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OpeningTime } from './entities/opening-time.entity';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class OpeningTimeService {
    constructor(
        @InjectRepository(OpeningTime) private openingTimeRepository: Repository<OpeningTime>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async getOpeningTime(data: any) {
        const cacheData = await this.cacheManager.get('openingTime');

        if (cacheData) {
            return {
                ok: true,
                status: 200,
                data: cacheData
            };
        }

        const openingTimes = await this.openingTimeRepository.find();

        const responseData = openingTimes.map(ot => ({
            dayOfWeek: ot.dayOfWeek,
            startTime: ot.startTime,
            endTime: ot.endTime
        }));

        await this.cacheManager.set('openingTime', responseData, 1800000);

        return {
            ok: true,
            status: 200,
            message: 'Lấy danh sách thời gian mở cửa thành công',
            data: responseData
        };
    }
}
