import { IsEmail } from "class-validator";

export class GetOtpDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;
}