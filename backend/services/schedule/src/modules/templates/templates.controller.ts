import { Controller, Inject } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class TemplatesController {
    constructor(
        private readonly holidayService: TemplatesService,
        @Inject('LOG_SERVICE') private logClient: ClientProxy
    ) { }

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
     * Lấy lịch làm việc mẫu của bác sĩ qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.id - ID của bác sĩ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetWeeklyTemplateByDoctor')
    async getWeeklyTemplateByDoctor(data: any) {
        try {
            this.processLog('GetWeeklyTemplateByDoctor', data.correlationId, 'Nhận được yêu cầu lấy lịch làm việc của bác sĩ');

            const result = await this.holidayService.getById(data);

            this.processLog('GetWeeklyTemplateByDoctor', data.correlationId, 'Kết thúc xử lý lấy lịch làm việc của bác sĩ');

            return result;
        } catch (error) {
            this.processLog('GetWeeklyTemplateByDoctor', data.correlationId, `Lỗi khi xử lý lấy lịch làm việc của bác sĩ: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
