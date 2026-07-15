import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningTimeModule } from './modules/openingtime/opening-time.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { TimeSlotsModule } from './modules/timeslots/time-slots.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      stores: [new KeyvRedis(process.env.REDIS_URL!)],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true
    }),
    OpeningTimeModule,
    HolidaysModule,
    TemplatesModule,
    TimeSlotsModule
  ]
})
export class AppModule { }
