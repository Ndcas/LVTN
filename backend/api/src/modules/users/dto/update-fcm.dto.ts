import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFcmTokenDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsString()
  deviceName?: string;
}
