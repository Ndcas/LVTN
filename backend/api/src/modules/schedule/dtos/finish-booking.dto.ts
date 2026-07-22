import { IsInt, IsOptional, IsString, IsArray, ValidateNested, Min, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionDetailDto {
    @IsInt()
    medicineId: number;

    @IsInt()
    @Min(1, { message: 'Số lượng ít nhất là 1' })
    quantity: number;

    @IsString()
    @IsNotEmpty({ message: 'Liều lượng dùng không được để trống' })
    @MaxLength(255, { message: 'Liều lượng dùng không quá 255 ký tự' })
    dosage: string;
}

export class FinishBookingDto {
    @IsString()
    @IsNotEmpty({ message: 'Thông tin triệu chứng không được bỏ trống' })
    clinicalIndicators: string;

    @IsInt()
    @IsOptional()
    diseaseId?: number;

    @IsString()
    @IsNotEmpty({ message: 'Chẩn đoán không được bỏ trống' })
    diagnoseDetail: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrescriptionDetailDto)
    @IsOptional()
    prescriptionDetails?: PrescriptionDetailDto[];
}
