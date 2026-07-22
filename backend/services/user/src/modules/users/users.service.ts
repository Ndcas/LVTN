import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { IsActive, User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailService: MailService
  ) { }

  async getRegisterOtp(data: any) {
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

  async register(data: any) {
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
      where: [{ email: data.email }, { phone: data.phone }]
    });

    if (existingUser) {
      return {
        ok: false,
        status: 400,
        error: 'Email hoặc số điện thoại đã được sử dụng'
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
      dob: data.dob || null,
      address: data.address || null
    });

    await this.userRepository.save(newUser);

    return {
      ok: true,
      status: 200,
      message: 'Đăng ký thành công',
    };
  }

  async login(data: any) {
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

    user.deviceId = data.deviceId || null;
    user.fcmToken = data.fcmToken || null;
    user.deviceName = data.deviceName || null;

    await this.userRepository.save(user);

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
      refreshToken
    };
  }

  async refresh(data: any) {
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

    const newPayload = {
      userId: payload.userId,
      fullName: payload.fullName,
      roleId: payload.roleId
    };
    const newAccessToken = await this.jwtService.signAsync(newPayload);
    let refreshToken = data.refreshToken;

    if (payload.exp * 1000 < Date.now() - 1296000000) {
      refreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '30d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });

      await this.cacheManager.set(`RT_${payload.userId}`, refreshToken, 2592000000);
    }

    return {
      ok: true,
      status: 200,
      message: 'Cấp lại token thành công',
      accessToken: newAccessToken,
      refreshToken
    };
  }

  async logout(data: any) {
    try {
      const payload = await this.jwtService.verifyAsync(data.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });
      await this.cacheManager.del(`RT_${payload.userId}`);

      await this.userRepository.update(payload.userId, {
        deviceId: null,
        fcmToken: null,
        deviceName: null
      });
    } catch (e) { }

    return {
      ok: true,
      status: 200,
      message: 'Đăng xuất thành công'
    };
  }

  async getForgotPasswordOtp(data: any) {
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

  async forgotPassword(data: any) {
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

  async updateFcmToken(data: any) {
    const { userId, deviceId, fcmToken, deviceName } = data;

    await this.userRepository.update(userId, {
      deviceId: deviceId || null,
      fcmToken: fcmToken || null,
      deviceName: deviceName || null
    });

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật FCM Token thành công'
    };
  }

  async getAll(data: any) {
    const { page = 1, limit = 10, search, roleId, isActive } = data;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.roleId',
        'user.phone',
        'user.email',
        'user.isActive',
        'user.fullName',
        'user.gender',
        'user.dob',
        'user.address',
        'user.createdAt',
        'role.name'
      ]);

    if (search) {
      qb.andWhere(
        '(user.fullName LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (roleId) {
      qb.andWhere('user.roleId = :roleId', { roleId });
    }

    if (isActive != undefined && isActive != null && isActive != '') {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      ok: true,
      status: 200,
      data: users.map(u => ({
        id: u.id,
        roleId: u.roleId,
        roleName: u.role?.name || '',
        phone: u.phone,
        email: u.email,
        isActive: u.isActive,
        fullName: u.fullName,
        gender: u.gender,
        dob: u.dob ? u.dob.toString() : '',
        address: u.address || '',
        createdAt: u.createdAt.toISOString()
      })),
      total,
      page,
      limit
    };
  }

  async getById(data: any) {
    const user = await this.userRepository.findOne({
      where: { id: data.id },
      relations: { role: true }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Người dùng không tồn tại'
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        id: user.id,
        roleId: user.roleId,
        roleName: user.role?.name || '',
        phone: user.phone,
        email: user.email,
        isActive: user.isActive,
        fullName: user.fullName,
        gender: user.gender,
        dob: user.dob ? user.dob.toString() : '',
        address: user.address || '',
        createdAt: user.createdAt.toISOString()
      }
    };
  }

  async createUser(data: any) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: data.email }, { phone: data.phone }]
    });

    if (existingUser) {
      return {
        ok: false,
        status: 400,
        error: 'Email hoặc số điện thoại đã được sử dụng'
      };
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS')!;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const newUser = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      fullName: data.fullName,
      gender: data.gender,
      dob: data.dob || null,
      address: data.address || null,
      roleId: data.roleId
    });

    await this.userRepository.save(newUser);

    return {
      ok: true,
      status: 201,
      message: 'Tạo tài khoản thành công'
    };
  }

  async updateUser(data: any) {
    const user = await this.userRepository.findOne({
      where: { id: data.id }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Người dùng không tồn tại'
      };
    }

    if (data.email && data.email != user.email) {
      const emailExists = await this.userRepository.exists({
        where: {
          email: data.email,
          id: Not(data.id)
        }
      });

      if (emailExists) {
        return {
          ok: false,
          status: 400,
          error: 'Email đã được sử dụng'
        };
      }

      user.email = data.email;
    }

    if (data.phone && data.phone != user.phone) {
      const phoneExists = await this.userRepository.exists({
        where: {
          phone: data.phone,
          id: Not(data.id)
        }
      });

      if (phoneExists) {
        return {
          ok: false,
          status: 400,
          error: 'Số điện thoại đã được sử dụng'
        };
      }

      user.phone = data.phone;
    }

    if (data.fullName) {
      user.fullName = data.fullName;
    }

    if (data.gender) {
      user.gender = data.gender;
    }

    if (data.dob != undefined) {
      user.dob = data.dob || null;
    }

    if (data.address != undefined) {
      user.address = data.address || null;
    }

    await this.userRepository.save(user);

    await this.cacheManager.del(`RT_${user.id}`);

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật người dùng thành công'
    };
  }

  async toggleActive(data: any) {
    const user = await this.userRepository.findOne({
      where: { id: data.id }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Người dùng không tồn tại'
      };
    }

    user.isActive = user.isActive == IsActive.ACTIVE ? IsActive.INACTIVE : IsActive.ACTIVE;

    await this.userRepository.save(user);

    await this.cacheManager.del(`RT_${user.id}`);



    return {
      ok: true,
      status: 200,
      message: 'Cập nhật trạng thái thành công'
    };
  }

  async getFcmTokenById(data: any) {
    const user = await this.userRepository.findOne({
      where: { id: data.id }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy người dùng'
      };
    }

    return {
      ok: true,
      status: 200,
      fcmToken: user.fcmToken
    };
  }
}
