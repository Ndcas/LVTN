import { IsEmail, MaxLength } from "class-validator";

export class GetOtpDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
    email: string;
}