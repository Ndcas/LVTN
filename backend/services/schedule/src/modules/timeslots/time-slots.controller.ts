import { Controller, Inject } from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class TimeSlotsController {
    constructor(private timeSlotsService: TimeSlotsService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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

    /**
     * Lên lịch khám
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'ScheduleTimeSlots')
    async scheduleTimeSlots(data: any) {
        this.processLog('ScheduleTimeSlots', data.correlationId, 'Nhận được yêu cầu lên lịch khám');

        this.timeSlotsService.scheduleTimeSlots().catch((error) => {
            this.processLog('ScheduleTimeSlots', data.correlationId, `Lỗi khi xử lý lên lịch khám: ${error}`, 'error');
        });

        this.processLog('ScheduleTimeSlots', data.correlationId, 'Kết thúc xử lý lên lịch khám');

        return {
            ok: true,
            status: 200,
            message: 'Đã nhận được yêu cầu, hệ thống đang tiến hành lên lịch'
        };
    }

    /**
     * Xóa time slot cũ
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'DeleteOldTimeSlots')
    async deleteOldTimeSlots(data: any) {
        this.processLog('DeleteOldTimeSlots', data.correlationId, 'Nhận được yêu cầu xóa time slot cũ');

        this.timeSlotsService.deleteOldTimeSlots().catch((error) => {
            this.processLog('DeleteOldTimeSlots', data.correlationId, `Lỗi khi xử lý xóa time slot cũ: ${error}`, 'error');
        });

        this.processLog('DeleteOldTimeSlots', data.correlationId, 'Kết thúc xử lý xóa time slot cũ');

        return {
            ok: true,
            status: 200,
            message: 'Đã nhận được yêu cầu, hệ thống đang tiến hành xóa time slot cũ'
        };
    }

    /**
     * Lấy số lượng lịch hẹn trong ngày hôm nay
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetTodayAppointmentsCount')
    async getTodayAppointmentsCount(data: any) {
        try {
            this.processLog('GetTodayAppointmentsCount', data.correlationId, 'Nhận được yêu cầu lấy số lượng lịch hẹn trong ngày hôm nay');

            const result = await this.timeSlotsService.getTodayAppointmentsCount(data);

            this.processLog('GetTodayAppointmentsCount', data.correlationId, 'Kết thúc xử lý lấy số lượng lịch hẹn trong ngày hôm nay');

            return result;
        } catch (error) {
            this.processLog('GetTodayAppointmentsCount', data.correlationId, `Lỗi khi xử lý lấy số lượng lịch hẹn trong ngày hôm nay: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống',
            };
        }
    }
}
