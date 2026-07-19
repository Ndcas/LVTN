import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine]),
    ClientsModule.register([
      {
        name: 'LOG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'log_queue',
          queueOptions: { durable: true }
        }
      }
    ])
  ],
  controllers: [MedicinesController],
  providers: [MedicinesService]
})
export class MedicinesModule { }
