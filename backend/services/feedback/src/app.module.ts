import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFeedback } from './entities/user-feedback.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true
    }),
    TypeOrmModule.forFeature([UserFeedback]),
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
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
