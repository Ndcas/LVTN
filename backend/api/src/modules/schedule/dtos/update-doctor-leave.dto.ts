import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateDoctorLeaveDto {
    @IsIn(['APPROVED', 'REJECTED'])
    status: string;

    @IsString()
    @IsOptional()
    rejectedReason?: string;
}