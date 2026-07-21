import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateDegreeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Tên bằng cấp tối đa 50 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Mô tả bằng cấp tối đa 255 ký tự' })
  description?: string;
}
