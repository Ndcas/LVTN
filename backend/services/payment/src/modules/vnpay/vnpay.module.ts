import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTransaction } from './entities/payment-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentTransaction]),
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
    controllers: [VnpayController],
    providers: [VnpayService]
})
export class VnpayModule { }