import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';
import { FeedbacksService } from './feedbacks.service';

@Controller()
export class FeedbacksController {
  constructor(
    private readonly feedbacksService: FeedbacksService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'feedback_service',
      correlationID: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lấy danh sách feedback qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.page - Số trang
   * @param {number} data.limit - Số lượng mỗi trang
   * @param {string} [data.read] - Trạng thái đã đọc (0 hoặc 1)
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('FeedbackService', 'GetAllFeedbacks')
  async getAllFeedbacks(data: { page: number; limit: number; read?: string; correlationId: string }) {
    try {
      this.processLog('GetAllFeedbacks', data.correlationId, 'Nhận được yêu cầu lấy danh sách feedback');

      const result = await this.feedbacksService.getAllFeedbacks(data);

      this.processLog('GetAllFeedbacks', data.correlationId, 'Kết thúc xử lý lấy danh sách feedback');

      return result;
    } catch (e) {
      this.processLog('GetAllFeedbacks', data.correlationId, `Lỗi khi xử lý lấy danh sách feedback: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy chi tiết feedback theo ID qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID của feedback
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('FeedbackService', 'GetFeedbackById')
  async getFeedbackById(data: { id: number; correlationId: string }) {
    try {
      this.processLog('GetFeedbackById', data.correlationId, 'Nhận được yêu cầu lấy chi tiết feedback');

      const result = await this.feedbacksService.getFeedbackById(data);

      this.processLog('GetFeedbackById', data.correlationId, 'Kết thúc xử lý lấy chi tiết feedback');

      return result;
    } catch (e) {
      this.processLog('GetFeedbackById', data.correlationId, `Lỗi khi xử lý lấy chi tiết feedback: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Tạo feedback mới qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.userId - ID của user gửi feedback
   * @param {string} data.title - Tiêu đề feedback
   * @param {string} data.content - Nội dung feedback
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('FeedbackService', 'CreateFeedback')
  async createFeedback(data: { userId: number; title: string; content: string; correlationId: string }) {
    try {
      this.processLog('CreateFeedback', data.correlationId, 'Nhận được yêu cầu tạo feedback');

      const result = await this.feedbacksService.createFeedback(data);

      this.processLog('CreateFeedback', data.correlationId, 'Kết thúc xử lý tạo feedback');

      return result;
    } catch (e) {
      this.processLog('CreateFeedback', data.correlationId, `Lỗi khi xử lý tạo feedback: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Đánh dấu feedback là đã đọc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID của feedback cần đánh dấu
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('FeedbackService', 'MarkAsRead')
  async markAsRead(data: { id: number; correlationId: string }) {
    try {
      this.processLog('MarkAsRead', data.correlationId, 'Nhận được yêu cầu đánh dấu feedback đã đọc');

      const result = await this.feedbacksService.markAsRead(data);

      this.processLog('MarkAsRead', data.correlationId, 'Kết thúc xử lý đánh dấu feedback đã đọc');

      return result;
    } catch (e) {
      this.processLog('MarkAsRead', data.correlationId, `Lỗi khi xử lý đánh dấu feedback đã đọc: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy số lượng feedback chưa đọc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('FeedbackService', 'GetUnreadCount')
  async getUnreadCount(data: { correlationId: string }) {
    try {
      this.processLog('GetUnreadCount', data.correlationId, 'Nhận được yêu cầu lấy số lượng feedback chưa đọc');

      const result = await this.feedbacksService.getUnreadCount(data);

      this.processLog('GetUnreadCount', data.correlationId, 'Kết thúc xử lý lấy số lượng feedback chưa đọc');

      return result;
    } catch (e) {
      this.processLog('GetUnreadCount', data.correlationId, `Lỗi khi xử lý lấy số lượng feedback chưa đọc: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }
}
