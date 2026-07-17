import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Booking]),
        ClientsModule.register([{
            name: 'LOG_SERVICE',
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RMQ_URL!],
                queue: 'log',
                queueOptions: { durable: true }
            }
        }]),
        ClientsModule.register([{
            name: 'NOTIFICATION_SERVICE',
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RMQ_URL!],
                queue: 'notification',
                queueOptions: { durable: true }
            }
        }])
    ],
    controllers: [BookingsController],
    providers: [BookingsService]
})
export class BookingsModule { }
