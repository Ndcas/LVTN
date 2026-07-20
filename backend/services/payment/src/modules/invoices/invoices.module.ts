import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Invoice } from './entities/invoice.entity';
import { PaymentTransaction } from '../vnpay/entities/payment-transaction.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice]),
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
    controllers: [InvoicesController],
    providers: [InvoicesService]
})
export class InvoicesModule { }