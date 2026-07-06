import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { Role } from './entities/role.entity';
import { Degree } from './entities/degree.entity';
import { Specialty } from './entities/specialty.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Degree, Specialty]),
    ClientsModule.register([
      {
        name: 'LOG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL!],
          queue: 'log',
          queueOptions: { durable: true }
        }
      }
    ])
  ],
  providers: [CatalogsService],
  controllers: [CatalogsController],
  exports: [CatalogsService]
})
export class CatalogsModule { }
