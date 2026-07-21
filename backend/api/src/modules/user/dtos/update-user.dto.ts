import { IsEmail, IsString, IsOptional, Matches, IsIn, IsDateString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^(84|0)\d{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  fullName?: string;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
  gender?: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Ngày sinh không hợp lệ' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Định dạng ngày sinh (YYYY-MM-DD) không hợp lệ' })
  dob?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Địa chỉ tối đa 255 ký tự' })
  address?: string;
}
