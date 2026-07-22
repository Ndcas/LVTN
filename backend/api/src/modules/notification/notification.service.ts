import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface NotificationServiceClient {
  getAllNotificationsByUserId(data: any): Observable<any>;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private notificationService: NotificationServiceClient;

  constructor(@Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.notificationService = this.client.getService<NotificationServiceClient>('NotificationService');
  }

  async getAllNotificationsByUserId(data: any) {
    return await firstValueFrom(this.notificationService.getAllNotificationsByUserId(data));
  }
}
