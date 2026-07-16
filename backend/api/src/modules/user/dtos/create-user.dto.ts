import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsIn, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  password: string;

  @IsString()
  @Matches(/^(84|0)\d{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
  gender: string;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Ngày sinh không hợp lệ' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Định dạng ngày sinh (YYYY-MM-DD) không hợp lệ' })
  dob?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ không hợp lệ' })
  address?: string;

  @IsInt({ message: 'Role ID không hợp lệ' })
  roleId: number;
}
