import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ScheduleChangeRequest } from './entities/schedule-change-request-detail.entity';
import { ScheduleChangeRequestDetail } from './entities/schedule-change-request.entity';

@Injectable()
export class ChangeRequestsService {
    constructor(
        @InjectRepository(ScheduleChangeRequest) private scheduleChangeRequestRepository: Repository<ScheduleChangeRequest>,
        @InjectRepository(ScheduleChangeRequestDetail) private scheduleChangeRequestDetailRepository: Repository<ScheduleChangeRequestDetail>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
}
