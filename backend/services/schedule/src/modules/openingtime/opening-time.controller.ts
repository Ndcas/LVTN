import { Controller, Inject } from '@nestjs/common';
import { OpeningTimeService } from './opening-time.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class OpeningTimeController {
    constructor(private openingTimeService: OpeningTimeService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

    private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
        this.logClient.emit('system_log', {
            level: level,
            message: `${action} ${info}`,
            service: 'schedule_service',
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Lấy danh sách giờ mở cửa qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetOpeningTime')
    async getOpeningTime(data: any) {
        try {
            this.processLog('GetOpeningTime', data.correlationId, 'Nhận được yêu cầu lấy danh sách thời gian mở cửa');

            const result = await this.openingTimeService.getOpeningTime(data);

            this.processLog('GetOpeningTime', data.correlationId, 'Kết thúc xử lý lấy danh sách thời gian mở cửa');

            return result;
        } catch (e) {
            this.processLog('GetOpeningTime', data.correlationId, `Lỗi khi xử lý lấy danh sách thời gian mở cửa: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
