import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MedicalRecord } from './entities/medical-record.entity';
import { PrescriptionDetail } from './entities/prescription-detail.entity';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, PrescriptionDetail]),
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
  controllers: [RecordsController],
  providers: [RecordsService]
})
export class RecordsModule { }
