import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.appService.handleSystemLog({
      level: level,
      message: `${action} ${info}`,
      service: 'log_service',
      correlationID: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lấy danh sách log
   * @param {Object} data
   * @param {string} data.correlationId
   * @param {string} data.keyword
   * @param {string} data.minLevel
   * @param {string} data.date
   * @param {string} data.traceId
   */
  @GrpcMethod('LogService', 'GetLogs')
  async getLogs(data: any) {
    try {
      this.processLog('getLogs', data.correlationId, 'Nhận được yêu cầu lấy danh sách log');

      const result = await this.appService.getLogs(data);

      this.processLog('getLogs', data.correlationId, 'Kết thúc xử lý lấy danh sách log');

      return result;
    } catch (error) {
      this.processLog('getLogs', data.correlationId, `Lỗi khi xử lý lấy danh sách log ${error}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  @EventPattern('system_log')
  handleSystemLog(@Payload() data: any) {

    this.appService.handleSystemLog(data);
  }
}
