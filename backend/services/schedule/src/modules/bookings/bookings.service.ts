import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }
}
