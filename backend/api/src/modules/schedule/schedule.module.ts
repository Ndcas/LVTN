import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
            name: 'LOG_SERVICE',
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RMQ_URL!],
                queue: 'log',
                queueOptions: { durable: true }
            }
        }])
    ],
    controllers: [],
    providers: []
})
export class ScheduleModule { }
