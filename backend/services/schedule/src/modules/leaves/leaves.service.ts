import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { DoctorLeave } from './entities/doctor-leave.entity';

@Injectable()
export class LeavesService {
    constructor(
        @InjectRepository(DoctorLeave) private readonly doctorLeaveRepository: Repository<DoctorLeave>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
}
