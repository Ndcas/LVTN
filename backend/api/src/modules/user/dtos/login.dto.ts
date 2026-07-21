import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  password: string;

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
