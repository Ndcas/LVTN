import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateMedicineDto {
  @IsString()
  @MaxLength(150, { message: 'Tên thuốc tối đa 150 ký tự' })
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(30, { message: 'Đơn vị tính tối đa 30 ký tự' })
  @IsOptional()
  unit?: string;

  @IsNumber({}, { message: 'Giá tiền phải là số' })
  @Min(0, { message: 'Giá tiền không được âm' })
  @IsOptional()
  pricePerUnit?: number;
}
