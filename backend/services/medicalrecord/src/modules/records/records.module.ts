import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionDetail } from './entities/prescription-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Prescription, PrescriptionDetail])],
})
export class RecordsModule {}
