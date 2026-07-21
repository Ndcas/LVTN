import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateChangeRequestStatusDto {
    @IsIn(['APPROVED', 'REJECTED'], { message: 'Trạng thái không hợp lệ' })
    status: string;

    @IsString()
    @IsOptional()
    @MaxLength(255, { message: 'Lý do từ chối tối đa 255 ký tự' })
    rejectedReason?: string;
}