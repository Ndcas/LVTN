import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateDoctorLeaveDto {
    @IsIn(['APPROVED', 'REJECTED'])
    status: string;

    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Lý do từ chối tối đa 255 ký tự' })
    rejectedReason?: string;
}