import { Controller, Inject } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class BookingsController {
    constructor(
        private readonly bookingsService: BookingsService,
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
     * Lấy danh sách lịch hẹn qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     * @param {number} data.page - Trang hiện tại
     * @param {number} data.limit - Số lượng mỗi trang
     * @param {number} data.patientId - ID bệnh nhân
     * @param {string} data.status - Trạng thái lịch hẹn
     */
    @GrpcMethod('ScheduleService', 'GetAllBookings')
    async getAll(data: any) {
        try {
            this.processLog('GetAllBookings', data.correlationId, 'Nhận được yêu cầu lấy danh sách lịch hẹn');

            const result = await this.bookingsService.getAll(data);

            this.processLog('GetAllBookings', data.correlationId, 'Kết thúc xử lý lấy danh sách lịch hẹn');

            return result;
        } catch (e) {
            this.processLog('GetAllBookings', data.correlationId, `Lỗi khi xử lý lấy danh sách lịch hẹn: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Lấy thông tin chi tiết lịch hẹn qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     * @param {number} data.id - ID lịch hẹn
     */
    @GrpcMethod('ScheduleService', 'GetBookingById')
    async getById(data: any) {
        try {
            this.processLog('GetBookingById', data.correlationId, 'Nhận được yêu cầu lấy thông tin chi tiết lịch hẹn');

            const result = await this.bookingsService.getById(data);

            this.processLog('GetBookingById', data.correlationId, 'Kết thúc xử lý lấy thông tin chi tiết lịch hẹn');

            return result;
        } catch (e) {
            this.processLog('GetBookingById', data.correlationId, `Lỗi khi xử lý lấy thông tin chi tiết lịch hẹn: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Đặt lịch khám mới qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     * @param {number} data.timeSlotId - ID khung giờ
     * @param {number} data.patientId - ID bệnh nhân
     */
    @GrpcMethod('ScheduleService', 'CreateBooking')
    async createBooking(data: any) {
        try {
            this.processLog('CreateBooking', data.correlationId, 'Nhận được yêu cầu tạo lịch hẹn');

            const result = await this.bookingsService.create(data);

            this.processLog('CreateBooking', data.correlationId, 'Kết thúc xử lý tạo lịch hẹn');

            return result;
        } catch (e) {
            this.processLog('CreateBooking', data.correlationId, `Lỗi khi xử lý tạo lịch hẹn: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Cập nhật trạng thái lịch hẹn qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     * @param {number} data.bookingId - ID lịch hẹn
     * @param {number} data.userId - ID người thực hiện (bác sĩ hoặc bệnh nhân)
     * @param {string} data.status - Trạng thái mới (CANCELED, FINISHED, NO_SHOW)
     */
    @GrpcMethod('ScheduleService', 'UpdateBookingStatus')
    async updateBookingStatus(data: any) {
        try {
            this.processLog('UpdateBookingStatus', data.correlationId, 'Nhận được yêu cầu cập nhật trạng thái lịch hẹn');

            const result = await this.bookingsService.updateStatus(data);

            this.processLog('UpdateBookingStatus', data.correlationId, 'Kết thúc xử lý cập nhật trạng thái lịch hẹn');

            return result;
        } catch (e) {
            this.processLog('UpdateBookingStatus', data.correlationId, `Lỗi khi xử lý cập nhật trạng thái lịch hẹn: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
