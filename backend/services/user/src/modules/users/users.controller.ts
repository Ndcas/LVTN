import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'user_service',
      correlationID: correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Xử lý đăng ký user mới qua gRPC
   * @param data.email - Email đăng nhập
   * @param data.password - Mật khẩu đã được mã hóa
   * @param data.phone - Số điện thoại
   * @param data.fullName - Họ tên đầy đủ
   * @param data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'Register')
  async register(data: any) {
    try {
      this.processLog('Register', data.correlationId, 'Bắt đầu xử lý đăng kí bệnh nhân');

      const result = await this.usersService.register(data);

      this.processLog('Register', data.correlationId, 'Kết thúc xử lý đăng kí bệnh nhân');

      return result;
    } catch (e) {
      this.processLog('Register', data.correlationId, `Lỗi khi xử lý đăng kí bệnh nhân: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống',
      };
    }
  }

  /**
   * Xử lý đăng nhập qua gRPC
   * @param data.email - Email đăng nhập
   * @param data.password - Mật khẩu plain text
   * @param data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'Login')
  async login(data: any) {
    try {
      this.processLog('Login', data.correlationId, 'Nhận được yêu cầu đăng nhập');

      const result = await this.usersService.login(data);

      this.processLog('Login', data.correlationId, 'Kết thúc xử lý đăng nhập');

      return result;
    } catch (e) {
      this.processLog('Login', data.correlationId, `Lỗi khi xử lý đăng nhập: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống',
      };
    }
  }

  /**
   * Cấp mới Access Token qua gRPC
   * @param data.refreshToken - Refresh token cũ hợp lệ
   * @param data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'Refresh')
  async refresh(data: any) {
    try {
      this.processLog('Refresh', data.correlationId, 'Nhận được yêu cầu cấp mới access token');

      const result = await this.usersService.refresh(data);

      this.processLog('Refresh', data.correlationId, 'Kết thúc xử lý cấp mới access token');

      return result;
    } catch (e) {
      this.processLog('Refresh', data.correlationId, `Lỗi khi xử lý cấp mới access token: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống',
      };
    }
  }

  /**
   * Xử lý đăng xuất và thu hồi token qua gRPC
   * @param data.refreshToken - Refresh token cần revoke
   * @param data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'Logout')
  async logout(data: any) {
    try {
      this.processLog('Logout', data.correlationId, 'Nhận được yêu cầu đăng xuất');

      const result = await this.usersService.logout(data);

      this.processLog('Logout', data.correlationId, 'Kết thúc xử lý đăng xuất');

      return result;
    } catch (e) {
      this.processLog('Logout', data.correlationId, `Lỗi khi xử lý đăng xuất: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống',
      };
    }
  }

  /**
   * Xử lý gửi email quên mật khẩu qua gRPC
   * @param data.email - Email cần lấy lại mật khẩu
   * @param data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'ForgotPassword')
  async forgotPassword(data: any) {
    try {
      this.processLog('ForgotPassword', data.correlationId, 'Nhận được yêu cầu quên mật khẩu');

      const result = await this.usersService.forgotPassword(data);

      this.processLog('ForgotPassword', data.correlationId, 'Kết thúc xử lý quên mật khẩu');

      return result;
    } catch (e) {
      this.processLog('ForgotPassword', data.correlationId, `Lỗi khi xử lý quên mật khẩu: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống',
      };
    }
  }
}
