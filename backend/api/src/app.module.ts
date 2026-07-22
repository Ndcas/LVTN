import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './modules/notification/notification.module';
import { UserModule } from './modules/user/user.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { MedicalRecordModule } from './modules/medicalrecord/medical-record.module';
import { PaymentModule } from './modules/payment/payment.module';
import { FeedbackModule } from './modules/feedback/feedback.module';

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
    FeedbackModule,
    UserModule,
    NotificationModule,
    ScheduleModule,
    MedicalRecordModule,
    PaymentModule
  ]
})
export class AppModule { }
