import { IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class UpdateSpecialtyDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Tên chuyên khoa tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Mã chuyên khoa tối đa 20 ký tự' })
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Phí khám mặc định phải là số' })
  @Min(0, { message: 'Phí khám mặc định phải lớn hơn hoặc bằng 0' })
  defaultFee?: number;
}
