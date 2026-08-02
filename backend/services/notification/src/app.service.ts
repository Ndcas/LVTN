import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { cert, initializeApp } from 'firebase-admin';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { lastValueFrom, Observable } from 'rxjs';
import { type ClientGrpc } from '@nestjs/microservices';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

interface UserServiceClient {
  getFcmTokenById(data: any): Observable<any>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private messaging: Messaging;
  private userService: UserServiceClient;

  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    private configService: ConfigService,
    @Inject('USER_PACKAGE') private userServiceClient: ClientGrpc
  ) { }

  onModuleInit() {
    this.userService = this.userServiceClient.getService<UserServiceClient>('UserService');
    const serviceAccountPath = join(process.cwd(), this.configService.get<string>('FIREBASE_ADMINSDK_JSON')!);
    const app = initializeApp({ credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))) });
    this.messaging = getMessaging(app);
  }

  async getAllByUserId(data: any) {
    const { id, page = 1, limit = 10 } = data;
    const offset = (page - 1) * limit;
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId: id },
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return {
      ok: true,
      status: 200,
      message: 'Lấy danh sách thông báo thành công',
      data: notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString()
      })),
      total,
      page,
      limit
    };
  }

  async sendMessage(data: any) {
    const { title, content, userId, correlationId } = data;
    const userResponse = await lastValueFrom(this.userService.getFcmTokenById({
      id: userId,
      correlationId
    }));

    if (!userResponse.ok) {
      return {
        ok: false,
        status: userResponse.status,
        error: userResponse.error
      };
    }

    const notification = this.notificationRepository.create({ userId, title, content });

    await this.notificationRepository.save(notification);

    if (!userResponse.fcmToken) {
      return {
        ok: true,
        status: 200,
        message: 'Người dùng không có thiết bị đăng nhập'
      };
    }

    await this.messaging.send({
      notification: {
        title,
        body: content
      },
      token: userResponse.fcmToken
    });

    return {
      ok: true,
      status: 200,
      message: 'Gửi thông báo thành công'
    };
  }
}
