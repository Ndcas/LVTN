import { IsEmail, IsNotEmpty, IsNumberString, IsString, MaxLength, MinLength } from "class-validator";

export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @MaxLength(100, { message: 'Email tối đa 100 ký tự' })
    email: string;

    @IsNumberString({}, { message: 'Mã OTP không hợp lệ' })
    @MinLength(6, { message: 'Mã OTP không hợp lệ' })
    @MaxLength(6, { message: 'Mã OTP không hợp lệ' })
    otp: string;

    @IsString()
    @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
    password: string;
}