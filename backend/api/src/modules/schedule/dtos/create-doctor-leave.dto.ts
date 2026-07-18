import { IsDateString, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateDoctorLeaveDto {
    @IsDateString({ strict: true }, { message: 'Ngày nghỉ lễ không hợp lệ' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày nghỉ không đúng định dạng (YYYY-MM-DD' })
    leaveDate: string;

    @IsNotEmpty()
    @IsString()
    reason: string;
}
