import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { DoctorWeeklyTemplate } from './entities/doctor-weekly-template.entity';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectRepository(DoctorWeeklyTemplate) private readonly doctorWeeklyTemplateRepository: Repository<DoctorWeeklyTemplate>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async getById(data: any) {
        const cachedTemplate = await this.cacheManager.get(`doctorWeeklyTemplate:${data.id}`);

        if (cachedTemplate) {
            return {
                ok: true,
                status: 200,
                data: cachedTemplate
            }
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

        await this.cacheManager.set(`doctorWeeklyTemplate:${data.id}`, result, 1800000);

        return {
            ok: true,
            status: 200,
            data: result
        }
    }
}
