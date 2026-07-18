import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChangeRequestsService } from './change-requests.service';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';
import { ScheduleChangeRequestDetail } from './entities/schedule-change-request-detail.entity';
import { ChangeRequestsController } from './change-requests.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleChangeRequest, ScheduleChangeRequestDetail]),
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
    controllers: [ChangeRequestsController],
    providers: [ChangeRequestsService]
})
export class ChangeRequestsModule { }
