import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notification',
      protoPath: join(process.cwd(), process.env.PROTO_PATH!),
      url: process.env.URL!
    }
  }, { inheritAppConfig: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL!],
      queue: 'notification',
      queueOptions: { durable: true }
    }
  }, { inheritAppConfig: true });

  await app.startAllMicroservices();

  await app.init();
}

bootstrap();