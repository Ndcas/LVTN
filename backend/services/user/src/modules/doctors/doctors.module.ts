import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { DoctorMetadata } from './entities/doctor-metadata.entity';
import { User } from '../users/entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorMetadata, User]),
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
  providers: [DoctorsService],
  controllers: [DoctorsController]
})
export class DoctorsModule { }
