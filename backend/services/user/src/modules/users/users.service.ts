import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async register(data: any): Promise<any> {
    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });

    if (existingUser) {
      return { status: 400, message: 'Email already exists' };
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const newUser = this.userRepository.create({
      ...data,
      password: hashedPassword,
      roleId: 2, // Mặc định tất cả người đăng ký mới đều là Bệnh nhân
    });
    await this.userRepository.save(newUser);

    return {
      status: 200,
      message: 'Register successful',
    };
  }

  async login(data: any): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) {
      return { status: 404, message: 'User not found' };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { status: 401, message: 'Invalid credentials' };
    }

    const payload = { sub: user.id, email: user.email, roleId: user.roleId };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '10m' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '30d' });

    return {
      status: 200,
      message: 'Login successful',
      accessToken,
      refreshToken
    };
  }

  async refresh(data: any): Promise<any> {
    try {
      const isBlacklisted = await this.cacheManager.get(`blacklist_rt_${data.refreshToken}`);
      if (isBlacklisted) {
        return { status: 401, message: 'Refresh token has been revoked' };
      }

      const payload = await this.jwtService.verifyAsync(data.refreshToken);
      const newPayload = { sub: payload.sub, email: payload.email, roleId: payload.roleId };
      const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '10m' });
      const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: '30d' });

      return {
        status: 200,
        message: 'Token refreshed',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (e) {
      return { status: 401, message: 'Invalid refresh token' };
    }
  }

  async logout(data: any): Promise<any> {
    if (data.refreshToken) {
      await this.cacheManager.set(`blacklist_rt_${data.refreshToken}`, 'revoked', 30 * 24 * 60 * 60 * 1000);
    }
    if (data.accessToken) {
      await this.cacheManager.set(`blacklist_at_${data.accessToken}`, 'revoked', 10 * 60 * 1000);
    }
    return {
      status: 200,
      message: 'Logged out successfully'
    };
  }

  async forgotPassword(data: any): Promise<any> {
    return {
      status: 200,
      message: 'Password reset link sent to your email'
    };
  }
}
