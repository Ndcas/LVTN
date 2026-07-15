import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TimeSlotsController } from './time-slots.controller';
import { TimeSlotsService } from './time-slots.service';
import { TimeSlot } from './entities/time-slot.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TimeSlot]),
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
    controllers: [TimeSlotsController],
    providers: [TimeSlotsService]
})
export class TimeSlotsModule { }
