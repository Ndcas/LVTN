import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDiseaseDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bệnh không được để trống' })
  @MaxLength(255, { message: 'Tên bệnh tối đa 255 ký tự' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã bệnh không được để trống' })
  @MaxLength(20, { message: 'Mã bệnh tối đa 20 ký tự' })
  diseaseCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Mô tả tối đa 500 ký tự' })
  description?: string;
}
