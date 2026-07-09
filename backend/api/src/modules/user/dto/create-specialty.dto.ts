import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateSpecialtyDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên chuyên khoa không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã chuyên khoa không được để trống' })
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Phí khám mặc định phải là số' })
  @Min(0, { message: 'Phí khám mặc định phải lớn hơn hoặc bằng 0' })
  defaultFee?: number;
}
