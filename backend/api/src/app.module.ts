import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([{
      name: 'USER_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), process.env.PROTO_PATH!),
        url: process.env.URL!,
      },
    }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
