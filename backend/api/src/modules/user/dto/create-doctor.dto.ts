import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn, IsInt, Min, Matches, IsDateString } from 'class-validator';

export class CreateDoctorDto {
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
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty({ message: 'Chuyên khoa không được để trống' })
  @IsInt({ message: 'ID chuyên khoa phải là số nguyên' })
  specialtyId: number;

  @IsNotEmpty({ message: 'Bằng cấp không được để trống' })
  @IsInt({ message: 'ID bằng cấp phải là số nguyên' })
  degreeId: number;

  @IsOptional()
  @IsInt({ message: 'Số năm kinh nghiệm phải là số nguyên' })
  @Min(0, { message: 'Số năm kinh nghiệm phải lớn hơn hoặc bằng 0' })
  experienceYears?: number;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsIn(['ONLINE', 'OFFLINE', 'BOTH'], { message: 'Loại hình khám không hợp lệ' })
  workType?: string;
}
