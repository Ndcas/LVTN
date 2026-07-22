import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { VnpayController } from './controllers/vnpay.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
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
      name: 'LOG_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL!],
        queue: 'log',
        queueOptions: { durable: true }
      }
    }])
  ],
  controllers: [VnpayController, InvoicesController],
  providers: [PaymentService],
})
export class PaymentModule { }
