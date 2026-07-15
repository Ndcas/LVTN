import { Controller, Inject } from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class TimeSlotsController {
    constructor(
        private readonly timeSlotsService: TimeSlotsService,
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
     * Lấy danh sách ca khám rảnh qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number[]} data.doctorIds - Mảng ID các bác sĩ
     * @param {string} data.date - Ngày khám
     * @param {string} data.startTime - Khung giờ bắt đầu
     * @param {string} data.endTime - Khung giờ kết thúc
     * @param {string} data.clinicType - Loại hình khám (ONLINE/OFFLINE)
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetAvailableTimeSlots')
    async getAvailableTimeSlots(data: any) {
        try {
            this.processLog('GetAvailableTimeSlots', data.correlationId, 'Nhận được yêu cầu lấy timeslot trống');

            const result = await this.timeSlotsService.getAvailableTimeSlots(data);

            this.processLog('GetAvailableTimeSlots', data.correlationId, 'Kết thúc xử lý lấy timeslot trống');

            return result;
        } catch (error) {
            this.processLog('GetAvailableTimeSlots', data.correlationId, `Lỗi khi xử lý lấy timeslot trống: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống',
            };
        }
    }
}
