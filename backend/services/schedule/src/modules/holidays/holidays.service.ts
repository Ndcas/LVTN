import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalHoliday } from './entities/global-holiday.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class HolidaysService {
    constructor(
        @InjectRepository(GlobalHoliday) private globalHolidayRepository: Repository<GlobalHoliday>,
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

    async getAll(data: any) {
        try {
            const cachedHolidays = await this.cacheManager.get('globalHolidays');

            if (cachedHolidays) {
                return {
                    ok: true,
                    status: 200,
                    message: 'Lấy danh sách ngày lễ thành công',
                    data: cachedHolidays
                };
            }
        } catch (error) {
            this.processLog('GetAllHolidays', data.correlationId, `Lỗi khi lấy danh sách ngày lễ từ cache: ${error}`, 'warn');
        }

        const holidays = await this.globalHolidayRepository.find();
        const dataResponse = holidays.map(holiday => ({
            id: holiday.id,
            holidayDate: holiday.holidayDate,
            name: holiday.name,
            description: holiday.description,
            createdAt: holiday.createdAt.toISOString()
        }));

        this.cacheManager.set('globalHolidays', dataResponse, 1800000).catch(e => {
            this.processLog('GetAllHolidays', data.correlationId, `Lỗi khi lưu danh sách ngày lễ vào cache: ${e}`, 'warn');
        });

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

        this.cacheManager.del('globalHolidays').catch(e => {
            this.processLog('CreateHoliday', data.correlationId, `Lỗi khi xóa danh sách ngày lễ khỏi cache: ${e}`, 'warn');
        });

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

        this.cacheManager.del('globalHolidays').catch(e => {
            this.processLog('UpdateHoliday', data.correlationId, `Lỗi khi xóa danh sách ngày lễ khỏi cache: ${e}`, 'warn');
        });

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

        this.cacheManager.del('globalHolidays').catch(e => {
            this.processLog('DeleteHoliday', data.correlationId, `Lỗi khi xóa danh sách ngày lễ khỏi cache: ${e}`, 'warn');
        });

        return {
            ok: true,
            status: 200,
            message: 'Xóa ngày lễ thành công'
        };
    }
}
