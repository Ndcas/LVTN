import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmTokensService } from './fcm-tokens.service';
import { FcmTokensController } from './fcm-tokens.controller';
import { UserFcmToken } from './entities/user-fcm-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserFcmToken])],
  providers: [FcmTokensService],
  controllers: [FcmTokensController]
})
export class FcmTokensModule {}
