import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { DoctorsController } from './doctors.controller';
import { CatalogsController } from './catalogs.controller';
import { UsersService } from './users.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'USER_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), process.env.PROTO_PATH!),
        url: process.env.USER_SERVICE_URL!,
      },
    }]),
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
  controllers: [UsersController, DoctorsController, CatalogsController],
  providers: [UsersService]
})
export class UsersModule { }
