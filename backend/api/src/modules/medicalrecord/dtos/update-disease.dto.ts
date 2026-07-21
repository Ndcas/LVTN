import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDiseaseDto {
  @IsString()
  @MaxLength(255, { message: 'Tên bệnh tối đa 255 ký tự' })
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(20, { message: 'Mã bệnh tối đa 20 ký tự' })
  @IsOptional()
  diseaseCode?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
