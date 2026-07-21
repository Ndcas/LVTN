import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateHolidayDto {
    @IsString()
    @IsOptional()
    @MaxLength(150, { message: 'Tên ngày lễ tối đa 150 ký tự' })
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Mô tả tối đa 255 ký tự' })
    description?: string;
}