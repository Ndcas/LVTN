import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalHoliday } from './entities/global-holiday.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class HolidaysService {
    constructor(
        @InjectRepository(GlobalHoliday) private readonly globalHolidayRepository: Repository<GlobalHoliday>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async getAll(data: any) {
        const cachedHolidays = await this.cacheManager.get('globalHolidays');

        if (cachedHolidays) {
            return {
                ok: true,
                status: 200,
                message: 'Lấy danh sách ngày lễ thành công',
                data: cachedHolidays
            };
        }

        const holidays = await this.globalHolidayRepository.find();

        const dataResponse = holidays.map(holiday => ({
            id: holiday.id,
            holidayDate: holiday.holidayDate,
            name: holiday.name,
            description: holiday.description,
            createdAt: holiday.createdAt.toISOString()
        }));

        await this.cacheManager.set('globalHolidays', dataResponse, 1800000);

        return {
            ok: true,
            status: 200,
            data: dataResponse
        };
    }

    async create(data: any) {
        const newHoliday = this.globalHolidayRepository.create({
            holidayDate: data.holidayDate,
            name: data.name,
            description: data.description
        });

        await this.globalHolidayRepository.save(newHoliday);

        await this.cacheManager.del('globalHolidays');

        return {
            ok: true,
            status: 200,
            message: 'Thêm ngày lễ thành công'
        };
    }

    async update(data: any) {
        const holiday = await this.globalHolidayRepository.findOne({
            where: { id: data.id }
        });

        if (!holiday) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy ngày lễ'
            };
        }

        if (data.name != undefined) {
            holiday.name = data.name;
        }

        if (data.description != undefined) {
            holiday.description = data.description || null;
        }

        await this.globalHolidayRepository.save(holiday);

        await this.cacheManager.del('globalHolidays');

        return {
            ok: true,
            status: 200,
            message: 'Cập nhật ngày lễ thành công'
        };
    }

    async remove(data: any) {
        const holiday = await this.globalHolidayRepository.findOne({
            where: { id: data.id }
        });

        if (!holiday) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy ngày lễ'
            };
        }

        await this.globalHolidayRepository.remove(holiday);

        await this.cacheManager.del('globalHolidays');

        return {
            ok: true,
            status: 200,
            message: 'Xóa ngày lễ thành công'
        };
    }
}
