import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OpeningTimeController } from './opening-time.controller';
import { HolidaysController } from './holidays.controller';
import { ScheduleService } from './schedule.service';
import { TimeSlotsController } from './time-slots.controller';

@Module({
    imports: [
        ClientsModule.register([{
            name: 'SCHEDULE_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'schedule',
                protoPath: join(process.cwd(), process.env.SCHEDULE_PROTO_PATH!),
                url: process.env.SCHEDULE_SERVICE_URL!,
            },
        }]),
        ClientsModule.register([{
            name: 'USER_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'user',
                protoPath: join(process.cwd(), process.env.USER_PROTO_PATH!),
                url: process.env.USER_SERVICE_URL!,
            },
        }]),
        ClientsModule.register([{
            name: 'LOG_SERVICE',
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RMQ_URL!],
                queue: 'log',
                queueOptions: { durable: true }
            }
        }])
    ],
    controllers: [OpeningTimeController, HolidaysController, TimeSlotsController],
    providers: [ScheduleService]
})
export class ScheduleModule { }
