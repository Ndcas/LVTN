import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsIn, IsNumberString, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  password: string;

  @IsString()
  @Matches(/^(84|0)\d{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  fullName: string;

  @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
  gender: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Ngày sinh không hợp lệ' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Định dạng ngày sinh (YYYY-MM-DD) không hợp lệ' })
  dob?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ không hợp lệ' })
  @MaxLength(255, { message: 'Địa chỉ tối đa 255 ký tự' })
  address?: string;

  @IsNumberString({}, { message: 'Mã OTP không hợp lệ' })
  @MinLength(6, { message: 'Mã OTP không hợp lệ' })
  @MaxLength(6, { message: 'Mã OTP không hợp lệ' })
  otp: string;
}
