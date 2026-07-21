import { IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên thuốc không được để trống' })
  @MaxLength(150, { message: 'Tên thuốc tối đa 150 ký tự' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Đơn vị tính không được để trống' })
  @MaxLength(30, { message: 'Đơn vị tính tối đa 30 ký tự' })
  unit: string;

  @IsNumber({}, { message: 'Giá tiền phải là số' })
  @Min(0, { message: 'Giá tiền không được âm' })
  pricePerUnit: number;
}
