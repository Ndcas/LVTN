import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { GlobalHoliday } from './entities/global-holiday.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([GlobalHoliday]),
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
    controllers: [HolidaysController],
    providers: [HolidaysService]
})
export class HolidaysModule { }
