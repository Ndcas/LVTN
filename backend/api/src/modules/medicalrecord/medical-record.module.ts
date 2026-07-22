import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { DiseasesController } from './controllers/diseases.controller';
import { MedicinesController } from './controllers/medicines.controller';
import { RecordsController } from './controllers/records.controller';
import { MedicalRecordService } from './medical-record.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'MEDICAL_RECORD_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'medicalrecord',
        protoPath: join(process.cwd(), process.env.MEDICAL_RECORD_PROTO_PATH!),
        url: process.env.MEDICAL_RECORD_SERVICE_URL!,
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
  controllers: [DiseasesController, MedicinesController, RecordsController],
  providers: [MedicalRecordService],
})
export class MedicalRecordModule { }
