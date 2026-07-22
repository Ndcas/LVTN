import { Controller, Get, Query, HttpException, UseGuards, Req, Inject } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { AccessGuard } from 'src/guards/access.guard';
import { ClientProxy } from '@nestjs/microservices';
import { type Request } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
   * Lấy danh sách thông báo
   * @param {string} page - Số trang
   * @param {string} limit - Số lượng mỗi trang
   * @param {Request} req - Request object để lấy headers
   */
  @UseGuards(AccessGuard)
  @Get()
  async getAllNotificationsByUserId(@Query('page') page: string, @Query('limit') limit: string, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllNotificationsByUserId', correlationId, 'Nhận được yêu cầu lấy danh sách thông báo');

    const result: any = await this.notificationService.getAllNotificationsByUserId({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      correlationId,
      id: (req as any).user.userId
    });

    if (!result.ok) {
      this.processLog('GetAllNotificationsByUserId', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllNotificationsByUserId', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
