import { IsNotEmpty, IsNumber, Min, Max, IsString, IsArray, ArrayMinSize, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class OpeningTimeDto {
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek: number

    @IsString()
    @IsNotEmpty()
    startTime: string

    @IsString()
    @IsNotEmpty()
    endTime: string
}

export class UpdateOpeningTimeDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OpeningTimeDto)
    openingTimes: OpeningTimeDto[]

}