import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsIn, IsNumberString, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  password: string;

  @IsString()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  dob: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ không hợp lệ' })
  address: string;

  @IsNumberString({}, { message: 'Mã OTP không hợp lệ' })
  @MinLength(6, { message: 'Mã OTP không hợp lệ' })
  @MaxLength(6, { message: 'Mã OTP không hợp lệ' })
  otp: string;
}
