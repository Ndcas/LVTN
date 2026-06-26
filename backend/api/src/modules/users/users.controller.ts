import { Controller, Post, Body, HttpStatus, Req, Inject, HttpException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshGuard } from 'src/guards/refresh.guard';
import { GetOtpDto } from './dto/getotp.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'api_gateway',
      correlationId: correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Lấy OTP đăng ký
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.email - Email cần lấy OTP đăng ký
   * @param {Request} req - Request object để lấy headers
   */
  @Post('get-register-otp')
  async getRegisterOtp(@Body() body: GetOtpDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetRegisterOtp', correlationId, 'Nhận được yêu cầu lấy OTP đăng ký');

    const result = await this.usersService.getRegisterOtp({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('GetRegisterOtp', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetRegisterOtp', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Đăng ký tài khoản người dùng mới
   * @param {Object} body - Dữ liệu đăng ký
   * @param {string} body.email - Email đăng nhập
   * @param {string} body.password - Mật khẩu
   * @param {string} body.phone - Số điện thoại
   * @param {string} body.fullName - Họ tên đầy đủ
   * @param {string} body.gender - Giới tính ('MALE', 'FEMALE', 'OTHER')
   * @param {string} body.dob - Ngày sinh
   * @param {string} body.address - Địa chỉ
   * @param {string} body.otp - Mã OTP xác nhận
   * @param {Request} req - Request object để lấy headers
   */
  @Post('register')
  async register(@Body() body: RegisterDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Register', correlationId, 'Nhận được yêu cầu đăng kí bệnh nhân');

    const result = await this.usersService.register({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('Register', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Register', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Đăng nhập hệ thống
   * @param {Object} body - Dữ liệu đăng nhập
   * @param {string} body.email - Email đăng nhập
   * @param {string} body.password - Mật khẩu
   * @param {Request} req - Request object để lấy headers
   */
  @Post('login')
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Login', correlationId, 'Nhận được yêu cầu đăng nhập');

    const result = await this.usersService.login({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('Login', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Login', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Cấp mới Access Token sử dụng Refresh Token
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.refreshToken - Refresh token cũ hợp lệ
   * @param {Request} req - Request object để lấy headers
   */
  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refresh(@Body() body: RefreshDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Refresh', correlationId, 'Nhận được yêu cầu cấp mới access token');

    const result = await this.usersService.refresh({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('Refresh', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Refresh', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Đăng xuất và đưa token vào Blacklist
   * @param {Request} req - Request object chứa refresh token trong authorization header
   */
  @Post('logout')
  async logout(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Logout', correlationId, 'Nhận được yêu cầu đăng xuất');

    const refreshToken = req.body.refreshToken;

    const result = await this.usersService.logout({ refreshToken, correlationId });

    if (!result.ok) {
      this.processLog('Logout', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Logout', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy OTP quên mật khẩu
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.email - Email cần lấy lại mật khẩu
   * @param {Request} req - Request object để lấy headers
   */
  @Post('get-forgot-password-otp')
  async getForgotPasswordOtp(@Body() body: GetOtpDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetForgotPasswordOtp', correlationId, 'Nhận được yêu cầu lấy OTP quên mật khẩu');

    const result = await this.usersService.getForgotPasswordOtp({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('GetForgotPasswordOtp', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetForgotPasswordOtp', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Đặt lại mật khẩu mới
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.email - Email cần đặt lại mật khẩu
   * @param {string} body.otp - Mã OTP xác nhận
   * @param {string} body.password - Mật khẩu mới
   * @param {Request} req - Request object để lấy headers
   */
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('ForgotPassword', correlationId, 'Nhận được yêu cầu quên mật khẩu');

    const result = await this.usersService.forgotPassword({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('ForgotPassword', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('ForgotPassword', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
