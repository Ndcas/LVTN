import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'NOTIFICATION_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'notification',
        protoPath: join(process.cwd(), process.env.NOTIFICATION_PROTO_PATH!),
        url: process.env.NOTIFICATION_SERVICE_URL!,
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
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule { }
