import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './middlewares/correlation_id.middleware';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;
  const PORT = parseInt(process.env.PORT!);

  app.use(correlationIdMiddleware);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [FRONTEND_DOMAIN],
    credentials: true
  });

  await app.listen(PORT);
}

bootstrap();
