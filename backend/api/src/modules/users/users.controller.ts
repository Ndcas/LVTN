import { Controller, Post, Body, HttpCode, HttpStatus, Req, Inject, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

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
   * Đăng ký tài khoản người dùng mới
   * @param {RegisterDto} body - Chứa thông tin đăng ký (email, password, phone, fullName)
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
   * @param {LoginDto} body - Chứa thông tin đăng nhập (email, password)
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
   * @param {RefreshDto} body - Chứa refresh token hợp lệ
   * @param {Request} req - Request object để lấy headers
   */
  @Post('refresh')
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

    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      this.processLog('Logout', correlationId, 'Không tìm thấy refresh token', 'warn');

      throw new HttpException('Refresh token không được để trống', HttpStatus.BAD_REQUEST);
    }

    const result = await this.usersService.logout({ refreshToken, correlationId });

    if (!result.ok) {
      this.processLog('Logout', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Logout', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;
    return data;
  }
}
