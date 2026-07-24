import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.use(correlationIdMiddleware);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN!],
    credentials: true
  });

  await app.listen(parseInt(process.env.PORT!));
}

bootstrap();
