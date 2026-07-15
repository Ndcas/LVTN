import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateHolidayDto {
    @IsDateString()
    holidayDate: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}