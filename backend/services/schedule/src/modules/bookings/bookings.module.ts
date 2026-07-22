import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
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
        }]),
        ClientsModule.register([{
            name: 'USER_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'user',
                protoPath: join(process.cwd(), process.env.USER_PROTO_PATH!),
                url: process.env.USER_SERVICE_URL,
            },
        }]),
        ClientsModule.register([{
            name: 'MEDICAL_RECORD_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'medicalrecord',
                protoPath: join(process.cwd(), process.env.MEDICAL_RECORD_PROTO_PATH!),
                url: process.env.MEDICAL_RECORD_SERVICE_URL,
            },
        }]),
        ClientsModule.register([{
            name: 'PAYMENT_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'payment',
                protoPath: join(process.cwd(), process.env.PAYMENT_PROTO_PATH!),
                url: process.env.PAYMENT_SERVICE_URL,
            },
        }])
    ],
    controllers: [BookingsController],
    providers: [BookingsService]
})
export class BookingsModule { }
