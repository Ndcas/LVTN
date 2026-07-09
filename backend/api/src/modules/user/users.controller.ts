import { Controller, Post, Get, Patch, Body, Req, Param, Query, Inject, HttpException, UseGuards, ParseIntPipe, Res } from '@nestjs/common';
import { UsersService } from './user.service';
import { type Response, type Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RefreshGuard } from 'src/guards/refresh.guard';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { GetOtpDto } from './dto/getotp.dto';
import { ForgotPasswordDto } from './dto/forgotpassword.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

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
  async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.headers['client-type'] != 'web' && req.headers['client-type'] != 'mobile') {
      throw new HttpException('Client type không hợp lệ', 400);
    }

    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Login', correlationId, 'Nhận được yêu cầu đăng nhập');

    const result = await this.usersService.login({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('Login', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Login', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    if (req.headers['client-type'] == 'web') {
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: 'none',
        maxAge: 2592000000
      });

      return {
        message: data.message,
        accessToken: data.accessToken
      };
    }

    return data;
  }

  /**
   * Cấp mới Access Token sử dụng Refresh Token
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.refreshToken - Refresh token cũ hợp lệ (mobile)
   * @param {Request} req - Request object để lấy headers
   */
  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refresh(@Body() body: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.headers['client-type'] != 'web' && req.headers['client-type'] != 'mobile') {
      throw new HttpException('Client type không hợp lệ', 400);
    }

    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Refresh', correlationId, 'Nhận được yêu cầu cấp mới access token');

    const result = await this.usersService.refresh({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('Refresh', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Refresh', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    if (req.headers['client-type'] == 'web') {
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: 'none',
        maxAge: 2592000000
      });

      return {
        message: data.message,
        accessToken: data.accessToken
      };
    }

    return data;
  }

  /**
   * Đăng xuất và đưa token vào Blacklist
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.refreshToken - Refresh token cũ hợp lệ
   * @param {Request} req - Request object để lấy headers
   */
  @Post('logout')
  @UseGuards(RefreshGuard)
  async logout(@Body() body: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('Logout', correlationId, 'Nhận được yêu cầu đăng xuất');

    const result = await this.usersService.logout({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('Logout', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('Logout', correlationId, 'Thành công');

    if (req.headers['client-type'] == 'web') {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: 'none'
      });
    }

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

  /**
   * Cập nhật FCM token
   * @param {Object} body - Dữ liệu yêu cầu
   * @param {string} body.deviceId - ID thiết bị
   * @param {string} body.fcmToken - FCM token
   * @param {string} body.deviceName - Tên thiết bị
   * @param {Request} req - Request object để lấy headers
   */
  @Post('update-fcm-token')
  async updateFcmToken(@Body() body: UpdateFcmTokenDto, @Req() req: any) {
    const correlationId = req.headers['correlation-id'] as string;
    const userId = req.user.userId;

    this.processLog('UpdateFcmToken', correlationId, 'Nhận được yêu cầu cập nhật FCM token');

    const result = await this.usersService.updateFcmToken({ ...body, userId, correlationId });

    if (!result.ok) {
      this.processLog('UpdateFcmToken', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateFcmToken', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy danh sách users (phân trang, search, filter)
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số bản ghi mỗi trang
   * @param {string} search - Tìm kiếm theo tên, email, SĐT
   * @param {number} roleId - Lọc theo role
   * @param {string} isActive - Lọc theo trạng thái ('0', '1')
   * @param {Request} req - Request object để lấy headers
   */
  @Get('list')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async getAllUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('roleId') roleId: string,
    @Query('isActive') isActive: string,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllUsers', correlationId, 'Nhận được yêu cầu lấy danh sách users');

    const result = await this.usersService.getAllUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || undefined,
      roleId: roleId ? parseInt(roleId) : undefined,
      isActive: isActive || undefined,
      correlationId,
    });

    if (!result.ok) {
      this.processLog('GetAllUsers', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllUsers', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy thông tin cá nhân của người dùng đang đăng nhập
   * @param {Request} req - Request object để lấy headers
   */
  @Get('me')
  @UseGuards(AccessGuard)
  async getMyProfile(@Req() req: any) {
    const correlationId = req.headers['correlation-id'] as string;
    const userId = req.user.userId;
    const roleId = req.user.roleId;

    this.processLog('GetMyProfile', correlationId, 'Nhận được yêu cầu lấy thông tin cá nhân');

    let result;

    if (roleId === 3) {
      result = await this.usersService.getDoctorById({ id: userId, correlationId });
    } else {
      result = await this.usersService.getUserById({ id: userId, correlationId });
    }

    if (!result.ok) {
      this.processLog('GetMyProfile', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetMyProfile', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy thông tin chi tiết user theo ID
   * @param {number} id - ID của user
   * @param {Request} req - Request object để lấy headers
   */
  @Get(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async getUserById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetUserById', correlationId, 'Nhận được yêu cầu lấy thông tin user');

    const result = await this.usersService.getUserById({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetUserById', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetUserById', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Tạo tài khoản người dùng mới (Dành cho Admin)
   * @param {Object} body - Dữ liệu đăng ký
   * @param {Request} req - Request object để lấy headers
   */
  @Post()
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async createUser(@Body() body: CreateUserDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateUser', correlationId, 'Nhận được yêu cầu tạo user mới');

    const result = await this.usersService.createUser({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('CreateUser', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateUser', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Cập nhật thông tin user
   * @param {number} id - ID của user
   * @param {Object} body - Dữ liệu cập nhật (partial)
   * @param {string} [body.phone] - Số điện thoại
   * @param {string} [body.email] - Email
   * @param {string} [body.fullName] - Họ tên
   * @param {string} [body.gender] - Giới tính ('MALE', 'FEMALE', 'OTHER')
   * @param {string} [body.dob] - Ngày sinh
   * @param {string} [body.address] - Địa chỉ
   * @param {Request} req - Request object để lấy headers
   */
  @Patch(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('UpdateUser', correlationId, 'Nhận được yêu cầu cập nhật user');

    const result = await this.usersService.updateUser({ id, ...body, correlationId });

    if (!result.ok) {
      this.processLog('UpdateUser', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateUser', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Bật/Tắt trạng thái active của user
   * @param {number} id - ID của user
   * @param {Request} req - Request object để lấy headers
   */
  @Patch(':id/toggle-active')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async toggleUserActive(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('ToggleUserActive', correlationId, 'Nhận được yêu cầu thay đổi trạng thái user');

    const result = await this.usersService.toggleUserActive({ id, correlationId });

    if (!result.ok) {
      this.processLog('ToggleUserActive', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('ToggleUserActive', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
