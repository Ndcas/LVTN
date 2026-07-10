import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.use(correlationIdMiddleware);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN],
    credentials: true
  });

  await app.listen(parseInt(process.env.PORT!));
}

bootstrap();
