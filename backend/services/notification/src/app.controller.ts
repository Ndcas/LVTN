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

      this.processLog('handleBookingCreated', correlationId, 'Nhận được yêu cầu tạo booking');

      const result = await this.appService.sendMessage({
        correlationId,
        title: 'Có lịch hẹn mới',
        content: `Bạn có một lịch hẹn ${clinic} mới vào ${date} lúc ${startTime}`,
        userId: doctorId
      });

      if (!result.ok) {
        this.processLog('handleBookingCreated', correlationId, `Lỗi khi gửi thông báo ${result.error}`, 'error');
      }

      this.processLog('handleBookingCreated', correlationId, 'Kết thúc xử lý tạo booking');
    } catch (error) {
      this.processLog('handleBookingCreated', data.correlationId, `Lỗi khi xử lý tạo booking ${error}`, 'error');
    }
  }

  @EventPattern('booking_canceled_by_patient')
  async handleBookingCanceledByPatient(data: any) {
    try {
      const { correlationId, doctorId, date, startTime, clinicType } = data;
      const clinic = clinicType == 'ONLINE' ? 'trực tuyến' : 'ngoại tuyến';

      this.processLog('handleBookingCanceledByPatient', correlationId, 'Nhận được yêu cầu hủy booking bởi bệnh nhân');

      const result = await this.appService.sendMessage({
        correlationId,
        title: 'Lịch hẹn bị hủy',
        content: `Lịch hẹn ${clinic} của bạn vào ngày ${date} lúc ${startTime} đã bị hủy bởi bệnh nhân`,
        userId: doctorId
      });

      if (!result.ok) {
        this.processLog('handleBookingCanceledByPatient', correlationId, `Lỗi khi gửi thông báo ${result.error}`, 'error');
      }

      this.processLog('handleBookingCanceledByPatient', correlationId, 'Kết thúc xử lý hủy booking bởi bệnh nhân');
    } catch (error) {
      this.processLog('handleBookingCanceledByPatient', data.correlationId, `Lỗi khi xử lý hủy booking bởi bệnh nhân ${error}`, 'error');
    }
  }

  @EventPattern('booking_canceled_by_doctor')
  async handleBookingCanceledByDoctor(data: any) {
    try {
      const { correlationId, patientId, date, startTime, clinicType } = data;
      const clinic = clinicType == 'ONLINE' ? 'trực tuyến' : 'ngoại tuyến';

      this.processLog('handleBookingCanceledByDoctor', correlationId, 'Nhận được yêu cầu hủy booking bởi bác sĩ');

      const result = await this.appService.sendMessage({
        correlationId,
        title: 'Lịch hẹn bị hủy',
        content: `Lịch hẹn ${clinic} của bạn vào ngày ${date} lúc ${startTime} đã bị hủy bởi bác sĩ`,
        userId: patientId
      });

      if (!result.ok) {
        this.processLog('handleBookingCanceledByDoctor', correlationId, `Lỗi khi gửi thông báo ${result.error}`, 'error');
      }

      this.processLog('handleBookingCanceledByDoctor', correlationId, 'Kết thúc xử lý hủy booking bởi bác sĩ');
    } catch (error) {
      this.processLog('handleBookingCanceledByDoctor', data.correlationId, `Lỗi khi xử lý hủy booking bởi bác sĩ ${error}`, 'error');
    }
  }
}
