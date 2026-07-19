import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disease } from './entities/disease.entity';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disease]),
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
  controllers: [DiseasesController],
  providers: [DiseasesService]
})
export class DiseasesModule { }
