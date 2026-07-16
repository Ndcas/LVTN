import { IsDateString, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateHolidayDto {
    @IsDateString({ strict: true }, { message: 'Ngày nghỉ lễ không hợp lệ' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Định dạng ngày nghỉ lễ (YYYY-MM-DD) không hợp lệ' })
    holidayDate: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}