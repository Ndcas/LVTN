import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên chuyên khoa không được để trống' })
  @MaxLength(100, { message: 'Tên chuyên khoa tối đa 100 ký tự' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã chuyên khoa không được để trống' })
  @MaxLength(20, { message: 'Mã chuyên khoa tối đa 20 ký tự' })
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Phí khám mặc định phải là số' })
  @Min(0, { message: 'Phí khám mặc định phải lớn hơn hoặc bằng 0' })
  defaultFee?: number;
}
