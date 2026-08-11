import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { DoctorWeeklyTemplate } from './entities/doctor-weekly-template.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectRepository(DoctorWeeklyTemplate) private doctorWeeklyTemplateRepository: Repository<DoctorWeeklyTemplate>,
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

    async getById(data: any) {
        try {
            const cachedTemplate = await this.cacheManager.get(`doctorWeeklyTemplate:${data.id}`);

            if (cachedTemplate) {
                return {
                    ok: true,
                    status: 200,
                    data: cachedTemplate
                };
            }
        } catch (error) {
            this.processLog('GetByIdTemplate', data.correlationId, `Lỗi khi lấy danh sách mẫu theo ID từ cache: ${error}`, 'warn');
        }

        const templates = await this.doctorWeeklyTemplateRepository.find({
            where: { doctorId: data.id }
        });

        const result = templates.map(t => ({
            dayOfWeek: t.dayOfWeek,
            startTime: t.startTime,
            endTime: t.endTime,
            clinicType: t.clinicType
        }));

        this.cacheManager.set(`doctorWeeklyTemplate:${data.id}`, result, 1800000).catch(e => {
            this.processLog('GetByIdTemplate', data.correlationId, `Lỗi khi lưu danh sách mẫu theo ID vào cache: ${e}`, 'warn');
        });

        return {
            ok: true,
            status: 200,
            data: result
        }
    }
}
