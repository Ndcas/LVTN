import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([{
      name: 'LOG_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL!],
        queue: 'log',
        queueOptions: { durable: true }
      }
    }]),
    MailModule
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
