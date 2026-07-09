import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { UserModule } from './modules/user/user.module';

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
    UserModule,
    FeedbackModule
  ]
})
export class AppModule { }
