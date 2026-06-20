import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { DoctorMetadata } from './entities/doctor-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorMetadata])],
  providers: [DoctorsService],
  controllers: [DoctorsController]
})
export class DoctorsModule {}
