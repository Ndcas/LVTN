import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      stores: [new KeyvRedis(process.env.REDIS_URL!)],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET!,
      signOptions: { expiresIn: '10m' },
    }),
    ClientsModule.register([{
      name: 'USER_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), process.env.PROTO_PATH!),
        url: process.env.URL!,
      },
    }]),
    UsersModule,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
