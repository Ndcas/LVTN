import { Module } from "@nestjs/common";
import { GeneralController } from "./general.controller";
import { GeneralService } from "./general.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "node:path";

@Module({
    imports: [
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
            name: 'SCHEDULE_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'schedule',
                protoPath: join(process.cwd(), process.env.SCHEDULE_PROTO_PATH!),
                url: process.env.SCHEDULE_SERVICE_URL!,
            },
        }]),
        ClientsModule.register([{
            name: 'PAYMENT_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'payment',
                protoPath: join(process.cwd(), process.env.PAYMENT_PROTO_PATH!),
                url: process.env.PAYMENT_SERVICE_URL!,
            },
        }]),
        ClientsModule.register([{
            name: 'FEEDBACK_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'feedback',
                protoPath: join(process.cwd(), process.env.FEEDBACK_PROTO_PATH!),
                url: process.env.FEEDBACK_SERVICE_URL!,
            },
        }]),
        ClientsModule.register([{
            name: 'LOG_PACKAGE',
            transport: Transport.GRPC,
            options: {
                package: 'log',
                protoPath: join(process.cwd(), process.env.LOG_PROTO_PATH!),
                url: process.env.LOG_SERVICE_URL!,
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
    controllers: [GeneralController],
    providers: [GeneralService]
})
export class GeneralModule { }