import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateSpecialtyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Phí khám mặc định phải là số' })
  @Min(0, { message: 'Phí khám mặc định phải lớn hơn hoặc bằng 0' })
  defaultFee?: number;
}
