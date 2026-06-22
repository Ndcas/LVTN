import { Controller, Post, Body, HttpCode, HttpStatus, Req, Inject } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, phase: string, correlationId: string, info: string) {
    this.logClient.emit('system_log', {
      level: 'info',
      message: `[${phase}] ${action} ${info}`,
      service: 'api_gateway',
      correlationID: correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Đăng ký tài khoản người dùng mới
   * @param body.email - Email đăng nhập
   * @param body.password - Mật khẩu (sẽ được mã hóa bcrypt)
   * @param body.phone - Số điện thoại liên lạc
   * @param body.fullName - Họ tên đầy đủ
   * @param req.headers['correlation-id'] - (Tùy chọn) Mã theo dõi request
   */
  @Post('register')
  async register(@Body() body: any, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Register', 'Start', correlationId, 'Bắt đầu xử lý đăng kí bệnh nhân');

    const result = await this.usersService.register({ ...body, correlationId });

    this.processLog('Register', 'End', correlationId, 'Kết thúc xử lý đăng kí bệnh nhân');

    return result;
  }

  /**
   * Đăng nhập hệ thống
   * @param body.email - Email đăng nhập
   * @param body.password - Mật khẩu chưa mã hóa
   * @param req.headers['correlation-id'] - (Tùy chọn) Mã theo dõi request
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Login', 'Start', correlationId, 'Bắt đầu xử lý đăng nhập');

    const result = await this.usersService.login({ ...body, correlationId });

    this.processLog('Login', 'End', correlationId, 'Kết thúc xử lý đăng nhập');

    return result;
  }

  /**
   * Cấp mới Access Token sử dụng Refresh Token
   * @param body.refreshToken - Refresh token hợp lệ chưa bị thu hồi
   * @param req.headers['correlation-id'] - (Tùy chọn) Mã theo dõi request
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() body: any, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Refresh', 'Start', correlationId, 'Bắt đầu xử lý cấp mới access token');

    const result = await this.usersService.refresh({ ...body, correlationId });

    this.processLog('Refresh', 'End', correlationId, 'Kết thúc xử lý cấp mới access token');

    return result;
  }

  /**
   * Đăng xuất và đưa token vào Blacklist
   * Yêu cầu xác thực JWT (Access Token trong Header)
   * @param body.refreshToken - Refresh token cần thu hồi
   * @param req.headers.authorization - Access Token hiện tại
   * @param req.headers['correlation-id'] - (Tùy chọn) Mã theo dõi request
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Body() body: any, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Logout', 'Start', correlationId, 'Bắt đầu xử lý đăng xuất');

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(' ')[1];

    const result = await this.usersService.logout({ ...body, accessToken, correlationId });

    this.processLog('Logout', 'End', correlationId, 'Kết thúc xử lý đăng xuất');

    return result;
  }
}
