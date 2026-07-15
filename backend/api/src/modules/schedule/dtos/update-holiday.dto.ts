import { IsOptional, IsString } from "class-validator";

export class UpdateHolidayDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}