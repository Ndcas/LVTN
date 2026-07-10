import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningTime } from './entities/opening-time';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OpeningTimeController } from './opening-time.controller';
import { OpeningTimeService } from './opening-time.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([OpeningTime]),
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
    controllers: [OpeningTimeController],
    providers: [OpeningTimeService]
})
export class OpeningTimeModule { }
