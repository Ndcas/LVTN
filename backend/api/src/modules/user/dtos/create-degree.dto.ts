import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateDegreeDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bằng cấp không được để trống' })
  @MaxLength(50, { message: 'Tên bằng cấp tối đa 50 ký tự' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Mô tả tối đa 255 ký tự' })
  description?: string;
}
