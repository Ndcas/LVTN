import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsNumber, IsString, Matches, Max, Min, ValidateNested } from "class-validator";

export class ChangeRequestDetailDto {
    @IsNumber({}, { message: 'Thứ trong tuần phải là số' })
    @Min(0, { message: 'Thứ trong tuần không hợp lệ' })
    @Max(6, { message: 'Thứ trong tuần không hợp lệ' })
    dayOfWeek: number;

    @IsString()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d:00$/, { message: 'Định dạng thời gian bắt đầu không hợp lệ (HH:MM:00)' })
    startTime: string;

    @IsString()
    @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d:00$/, { message: 'Định dạng thời gian kết thúc không hợp lệ (HH:MM:00)' })
    endTime: string;

    @IsIn(['ONLINE', 'OFFLINE'], { message: 'Loại ca làm việc không hợp lệ' })
    clinicType: string;
}

export class CreateChangeRequestDto {
    @ValidateNested({ each: true })
    @Type(() => ChangeRequestDetailDto)
    @IsArray()
    @ArrayMinSize(1, { message: 'Danh sách lịch làm việc không được rỗng' })
    details: ChangeRequestDetailDto[]
}