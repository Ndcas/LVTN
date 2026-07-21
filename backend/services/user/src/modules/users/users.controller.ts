import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private usersService: UsersService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'user_service',
      correlationID: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lấy OTP đăng ký qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.email - Email cần lấy OTP
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetRegisterOtp')
  async getRegisterOtp(data: any) {
    try {
      this.processLog('GetRegisterOtp', data.correlationId, 'Nhận được yêu cầu lấy OTP đăng ký');

      const result = await this.usersService.getRegisterOtp(data);

      this.processLog('GetRegisterOtp', data.correlationId, 'Kết thúc xử lý lấy OTP đăng ký');

      return result;
    } catch (e) {
      this.processLog('GetRegisterOtp', data.correlationId, `Lỗi khi xử lý lấy OTP đăng ký: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Xử lý đăng ký user mới qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.email - Email đăng nhập
   * @param {string} data.password - Mật khẩu plain text
   * @param {string} data.phone - Số điện thoại
   * @param {string} data.fullName - Họ tên đầy đủ
   * @param {string} data.gender - Giới tính ('M', 'F', 'O')
   * @param {string} data.dob - Ngày sinh
   * @param {string} data.address - Địa chỉ
   * @param {string} data.otp - Mã OTP xác thực
   * @param {string} data.correlationId - ID theo dõi request
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
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Xử lý đăng nhập qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.email - Email đăng nhập
   * @param {string} data.password - Mật khẩu plain text
   * @param {string} data.correlationId - ID theo dõi request
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
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cấp mới Access Token qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.refreshToken - Refresh token cũ hợp lệ
   * @param {string} data.correlationId - ID theo dõi request
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
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Xử lý đăng xuất và thu hồi token qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.refreshToken - Refresh token cần revoke
   * @param {string} data.correlationId - ID theo dõi request
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
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy OTP quên mật khẩu qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.email - Email cần lấy OTP
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetForgotPasswordOtp')
  async getForgotPasswordOtp(data: any) {
    try {
      this.processLog('GetForgotPasswordOtp', data.correlationId, 'Nhận được yêu cầu lấy OTP quên mật khẩu');

      const result = await this.usersService.getForgotPasswordOtp(data);

      this.processLog('GetForgotPasswordOtp', data.correlationId, 'Kết thúc xử lý lấy OTP quên mật khẩu');

      return result;
    } catch (e) {
      this.processLog('GetForgotPasswordOtp', data.correlationId, `Lỗi khi xử lý lấy OTP quên mật khẩu: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Xử lý đặt lại mật khẩu qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.email - Email cần lấy lại mật khẩu
   * @param {string} data.otp - Mã OTP xác thực
   * @param {string} data.password - Mật khẩu mới
   * @param {string} data.correlationId - ID theo dõi request
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
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật FCM token qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.userId - ID của user
   * @param {string} data.deviceId - ID thiết bị
   * @param {string} data.fcmToken - FCM token
   * @param {string} data.deviceName - Tên thiết bị
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'UpdateFcmToken')
  async updateFcmToken(data: any) {
    try {
      this.processLog('UpdateFcmToken', data.correlationId, 'Nhận được yêu cầu cập nhật FCM token');

      const result = await this.usersService.updateFcmToken(data);

      this.processLog('UpdateFcmToken', data.correlationId, 'Kết thúc xử lý cập nhật FCM token');

      return result;
    } catch (e) {
      this.processLog('UpdateFcmToken', data.correlationId, `Lỗi khi xử lý cập nhật FCM token: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy danh sách tất cả users (phân trang + filter) qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.page - Trang hiện tại
   * @param {number} data.limit - Số bản ghi mỗi trang
   * @param {string} data.search - Tìm kiếm theo tên, email, SĐT
   * @param {number} data.roleId - Lọc theo role
   * @param {string} data.isActive - Lọc theo trạng thái ('0', '1')
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllUsers')
  async getAllUsers(data: any) {
    try {
      this.processLog('GetAllUsers', data.correlationId, 'Nhận được yêu cầu lấy danh sách users');

      const result = await this.usersService.getAll(data);

      this.processLog('GetAllUsers', data.correlationId, 'Kết thúc xử lý lấy danh sách users');

      return result;
    } catch (e) {
      this.processLog('GetAllUsers', data.correlationId, `Lỗi khi xử lý lấy danh sách users: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy thông tin chi tiết user theo ID qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID của user
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: any) {
    try {
      this.processLog('GetUserById', data.correlationId, 'Nhận được yêu cầu lấy thông tin user');

      const result = await this.usersService.getById(data);

      this.processLog('GetUserById', data.correlationId, 'Kết thúc xử lý lấy thông tin user');

      return result;
    } catch (e) {
      this.processLog('GetUserById', data.correlationId, `Lỗi khi xử lý lấy thông tin user: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Tạo user mới (Dành cho Admin) qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   */
  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: any) {
    try {
      this.processLog('CreateUser', data.correlationId, 'Nhận được yêu cầu tạo user mới');

      const result = await this.usersService.createUser(data);

      this.processLog('CreateUser', data.correlationId, 'Kết thúc xử lý tạo user mới');

      return result;
    } catch (e) {
      this.processLog('CreateUser', data.correlationId, `Lỗi khi xử lý tạo user mới: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật thông tin user qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID của user
   * @param {string} data.phone - Số điện thoại mới
   * @param {string} data.email - Email mới
   * @param {string} data.fullName - Họ tên mới
   * @param {string} data.gender - Giới tính mới
   * @param {string} data.dob - Ngày sinh mới
   * @param {string} data.address - Địa chỉ mới
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'UpdateUser')
  async updateUser(data: any) {
    try {
      this.processLog('UpdateUser', data.correlationId, 'Nhận được yêu cầu cập nhật user');

      const result = await this.usersService.updateUser(data);

      this.processLog('UpdateUser', data.correlationId, 'Kết thúc xử lý cập nhật user');

      return result;
    } catch (e) {
      this.processLog('UpdateUser', data.correlationId, `Lỗi khi xử lý cập nhật user: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Bật/Tắt trạng thái active của user qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID của user
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'ToggleUserActive')
  async toggleUserActive(data: any) {
    try {
      this.processLog('ToggleUserActive', data.correlationId, 'Nhận được yêu cầu thay đổi trạng thái user');

      const result = await this.usersService.toggleActive(data);

      this.processLog('ToggleUserActive', data.correlationId, 'Kết thúc xử lý thay đổi trạng thái user');

      return result;
    } catch (e) {
      this.processLog('ToggleUserActive', data.correlationId, `Lỗi khi xử lý thay đổi trạng thái user: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }
}
