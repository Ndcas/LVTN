import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { DoctorsController } from './controllers/doctors.controller';
import { CatalogsController } from './controllers/catalogs.controller';
import { UserService } from './user.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'USER_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), process.env.USER_PROTO_PATH!),
        url: process.env.USER_SERVICE_URL!,
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
  controllers: [UsersController, DoctorsController, CatalogsController],
  providers: [UserService]
})
export class UserModule { }
