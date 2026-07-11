import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalHoliday } from './entities/global-holiday.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class HolidaysService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(GlobalHoliday) private readonly globalHolidayRepository: Repository<GlobalHoliday>
    ) { }
}
