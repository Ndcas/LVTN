import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateHolidayDto {
    @IsDateString({ strict: true }, { message: 'Ngày nghỉ lễ không hợp lệ' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Định dạng ngày nghỉ lễ (YYYY-MM-DD) không hợp lệ' })
    holidayDate: string;

    @IsString()
    @IsNotEmpty({ message: 'Tên ngày nghỉ lễ không được để trống' })
    @MaxLength(150, { message: 'Tên ngày nghỉ lễ tối đa 150 ký tự' })
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Mô tả tối đa 255 ký tự' })
    description?: string;
}