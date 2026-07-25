import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, EventPattern, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'notification_service',
      correlationID: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lấy danh sách thông báo theo user_id
   * @param {Object} data
   * @param {number} data.id
   * @param {string} data.correlationId
   */
  @GrpcMethod('NotificationService', 'GetAllNotificationsByUserId')
  async getAllNotificationsByUserId(data: any) {
    try {
      this.processLog('getAllNotificationsByUserId', data.correlationId, 'Nhận được yêu cầu lấy danh sách thông báo');

      const result = await this.appService.getAllByUserId(data);

      this.processLog('getAllNotificationsByUserId', data.correlationId, 'Kết thúc xử lý lấy danh sách thông báo');
      return result;
    } catch (error) {
      this.processLog('getAllNotificationsByUserId', data.correlationId, `Lỗi khi xử lý lấy danh sách thông báo ${error}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  @EventPattern('booking_created')
  async handleBookingCreated(data: any) {
    try {
      const { correlationId, doctorId, date, startTime, clinicType } = data;
      const clinic = clinicType == 'ONLINE' ? 'trực tuyến' : 'ngoại tuyến';

      this.processLog('handleBookingCreated', correlationId, 'Nhận được yêu gửi thông báo booking đã được tạo');

      const result = await this.appService.sendMessage({
        correlationId,
        title: 'Có lịch hẹn mới',
        content: `Bạn có một lịch hẹn ${clinic} mới vào ${date} lúc ${startTime}`,
        userId: doctorId
      });

      if (!result.ok) {
        this.processLog('handleBookingCreated', correlationId, `Lỗi khi gửi thông báo ${result.error}`, 'error');
      }

      this.processLog('handleBookingCreated', correlationId, 'Kết thúc xử lý gửi thông báo booking đã được tạo');
    } catch (error) {
      this.processLog('handleBookingCreated', data.correlationId, `Lỗi khi gửi thông báo booking đã được tạo ${error}`, 'error');
    }
  }

  @EventPattern('booking_canceled')
  async handleBookingCanceled(data: any) {
    try {
      const { correlationId, userId, date, startTime, clinicType, sourceRoleId } = data;
      const clinic = clinicType == 'ONLINE' ? 'trực tuyến' : 'ngoại tuyến';
      let sourceRole = 'hệ thống';

      switch (sourceRoleId) {
        case 2:
          sourceRole = 'bác sĩ';
          break;
        case 3:
          sourceRole = 'bệnh nhân';
          break;
      }

      this.processLog('handleBookingCanceled', correlationId, 'Nhận được yêu cầu gửi thông báo booking đã bị hủy');

      const result = await this.appService.sendMessage({
        correlationId,
        title: 'Lịch hẹn bị hủy',
        content: `Lịch hẹn ${clinic} của bạn vào ngày ${date} lúc ${startTime} đã bị hủy bởi ${sourceRole}`,
        userId: userId
      });

      if (!result.ok) {
        this.processLog('handleBookingCanceled', correlationId, `Lỗi khi gửi thông báo ${result.error}`, 'error');
      }

      this.processLog('handleBookingCanceled', correlationId, 'Kết thúc xử lý gửi thông báo booking đã bị hủy');
    } catch (error) {
      this.processLog('handleBookingCanceled', data.correlationId, `Lỗi khi gửi thông báo booking đã bị hủy ${error}`, 'error');
    }
  }

  @EventPattern('video_call')
  async handleVideoCall(data: any) {
    try {
      const { correlationId, bookingId, sourceRoleId, userId } = data;
      let sourceRole = 'hệ thống';

      switch (sourceRoleId) {
        case 2:
          sourceRole = 'bác sĩ';
          break;
        case 3:
          sourceRole = 'bệnh nhân';
          break;
      }

      this.processLog('handleVideoCall', correlationId, 'Nhận được yêu gửi thông báo video call');

      const result = await this.appService.sendMessage({
        correlationId,
        title: `Ca khám ONLINE #${bookingId} đã bắt đầu`,
        content: `${sourceRole} đã bắt đầu gọi video. Vui lòng tham gia`,
        userId: userId
      });

      if (!result.ok) {
        this.processLog('handleVideoCall', correlationId, `Lỗi khi gửi thông báo ${result.error}`, 'error');
      }

      this.processLog('handleVideoCall', correlationId, 'Kết thúc xử lý gửi thông báo video call');
    } catch (error) {
      this.processLog('handleVideoCall', data.correlationId, `Lỗi khi gửi thông báo video call ${error}`, 'error');
    }
  }
}
