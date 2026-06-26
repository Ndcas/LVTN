import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
  ) { }

  async getRegisterOtp(data: any): Promise<any> {
    const email = data.email;

    const existingUser = await this.userRepository.exists({
      where: { email: data.email }
    });

    if (existingUser) {
      return {
        ok: false,
        status: 400,
        error: 'Email đã được sử dụng'
      };
    }

    const existingOtp = await this.cacheManager.get(`OTP_R_${email}`);

    if (existingOtp) {
      return {
        ok: false,
        status: 400,
        error: 'OTP đã được gửi đến email của bạn'
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.mailService.sendMail(
      email,
      'Xác nhận đăng ký tài khoản',
      `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 15 phút`,
      `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 15 phút`
    );

    await this.cacheManager.set(`OTP_R_${email}`, otp, 900000);

    return {
      ok: true,
      status: 200,
      message: 'OTP đã được gửi đến email của bạn'
    };
  }

  async register(data: any): Promise<any> {
    const otp = await this.cacheManager.get(`OTP_R_${data.email}`);

    if (!otp || otp != data.otp) {
      return {
        ok: false,
        status: 400,
        error: 'OTP không hợp lệ'
      };
    }

    await this.cacheManager.del(`OTP_R_${data.email}`);

    const existingUser = await this.userRepository.exists({
      where: { email: data.email }
    });

    if (existingUser) {
      return {
        ok: false,
        status: 400,
        error: 'Email đã được sử dụng'
      };
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS')!;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const newUser = this.userRepository.create({
      roleId: 3,
      phone: data.phone,
      password: hashedPassword,
      email: data.email,
      fullName: data.fullName,
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : null,
      address: data.address || null
    });

    await this.userRepository.save(newUser);

    return {
      ok: true,
      status: 200,
      message: 'Đăng ký thành công',
    };
  }

  async login(data: any): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Thông tin đăng nhập không chính xác'
      };
    }

    if (user.isActive == '0') {
      return {
        ok: false,
        status: 403,
        error: 'Tài khoản đã bị vô hiệu hóa'
      };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      return {
        ok: false,
        status: 401,
        error: 'Thông tin đăng nhập không chính xác'
      };
    }

    const payload = {
      userId: user.id,
      fullName: user.fullName,
      roleId: user.roleId
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')
    });

    await this.cacheManager.set(`RT_${user.id}`, refreshToken, 2592000000);

    return {
      ok: true,
      status: 200,
      message: 'Đăng nhập thành công',
      accessToken,
      refreshToken,
      role: user.roleId
    };
  }

  async refresh(data: any): Promise<any> {
    let payload: any = {};

    try {
      payload = await this.jwtService.verifyAsync(data.refreshToken, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') });
    } catch (error) {
      return {
        ok: false,
        status: 401,
        error: 'Refresh token không hợp lệ'
      };
    }

    const cachedToken = await this.cacheManager.get(`RT_${payload.userId}`);

    if (!cachedToken || cachedToken != data.refreshToken) {
      return {
        ok: false,
        status: 401,
        error: 'Refresh token không hợp lệ'
      };
    }

    const isBlacklisted = await this.cacheManager.get(`BL_${payload.userId}`);

    if (isBlacklisted) {
      return {
        ok: false,
        status: 401,
        error: 'Refresh token không hợp lệ'
      };
    }

    const newPayload = {
      userId: payload.userId,
      fullName: payload.fullName,
      roleId: payload.roleId
    };
    const newAccessToken = await this.jwtService.signAsync(newPayload);

    return {
      ok: true,
      status: 200,
      message: 'Cấp lại token thành công',
      accessToken: newAccessToken,
      refreshToken: data.refreshToken,
      role: payload.roleId
    };
  }

  async logout(data: any): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(data.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });
      await this.cacheManager.del(`RT_${payload.userId}`);
    } catch (e) { }

    return {
      ok: true,
      status: 200,
      message: 'Đăng xuất thành công'
    };
  }

  async getForgotPasswordOtp(data: any): Promise<any> {
    const email = data.email;

    let existingUser = await this.userRepository.exists({
      where: { email: email }
    });

    if (!existingUser) {
      return {
        ok: false,
        status: 404,
        error: 'Email không tồn tại'
      };
    }

    let existingOtp = await this.cacheManager.get(`OTP_FP_${email}`);

    if (existingOtp) {
      return {
        ok: false,
        status: 400,
        error: 'OTP đã được gửi đến email của bạn'
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.mailService.sendMail(
      email,
      'Xác nhận quên mật khẩu',
      `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 15 phút`,
      `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 15 phút`
    );

    await this.cacheManager.set(`OTP_FP_${email}`, otp, 900000);

    return {
      ok: true,
      status: 200,
      message: 'OTP đã được gửi đến email của bạn'
    };
  }

  async forgotPassword(data: any): Promise<any> {
    const otp = await this.cacheManager.get(`OTP_FP_${data.email}`);

    if (!otp || otp != data.otp) {
      return {
        ok: false,
        status: 400,
        error: 'OTP không hợp lệ'
      };
    }

    await this.cacheManager.del(`OTP_FP_${data.email}`);

    const user = await this.userRepository.findOne({
      where: { email: data.email }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Email không tồn tại'
      };
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS')!;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      ok: true,
      status: 200,
      message: 'Đặt lại mật khẩu thành công'
    };
  }
}
