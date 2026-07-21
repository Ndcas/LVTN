import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class CreateDoctorLeaveDto {
    @IsDateString({ strict: true }, { message: 'Ngày nghỉ lễ không hợp lệ' })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày nghỉ không đúng định dạng (YYYY-MM-DD' })
    leaveDate: string;

    @IsNotEmpty({ message: 'Lý do không được để trống' })
    @IsString()
    @MaxLength(255, { message: 'Lý do tối đa 255 ký tự' })
    reason: string;
}
