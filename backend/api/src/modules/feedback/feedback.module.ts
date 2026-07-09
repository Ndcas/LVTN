import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'FEEDBACK_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'feedback',
        protoPath: join(process.cwd(), process.env.FEEDBACK_PROTO_PATH!),
        url: process.env.FEEDBACK_SERVICE_URL!,
      },
    }]),
    ClientsModule.register([
      {
        name: 'LOG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL!],
          queue: 'log',
          queueOptions: { durable: true }
        }
      }
    ])
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService]
})
export class FeedbackModule { }
