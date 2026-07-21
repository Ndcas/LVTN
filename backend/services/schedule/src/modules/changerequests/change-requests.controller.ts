import { Controller, Inject } from '@nestjs/common';
import { ChangeRequestsService } from './change-requests.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class ChangeRequestsController {
    constructor(private changeRequestsService: ChangeRequestsService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
     * Tạo yêu cầu thay đổi lịch làm việc
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.doctorId - ID của bác sĩ
     * @param {Object[]} data.details - Danh sách chi tiết yêu cầu thay đổi
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'CreateScheduleChangeRequest')
    async createScheduleChangeRequest(data: any) {
        try {
            this.processLog('CreateScheduleChangeRequest', data.correlationId, 'Nhận được yêu cầu tạo yêu cầu thay đổi');

            const result = await this.changeRequestsService.create(data);

            this.processLog('CreateScheduleChangeRequest', data.correlationId, 'Kết thúc xử lý tạo yêu cầu thay đổi');

            return result;
        } catch (e) {
            this.processLog('CreateScheduleChangeRequest', data.correlationId, `Lỗi khi xử lý tạo yêu cầu thay đổi: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Lấy danh sách yêu cầu thay đổi lịch làm việc
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} [data.page=1] - Trang hiện tại
     * @param {number} [data.limit=10] - Số lượng trên mỗi trang
     * @param {number} [data.doctorId] - ID của bác sĩ (tùy chọn để lọc)
     * @param {string} [data.status] - Trạng thái yêu cầu (tùy chọn để lọc)
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetAllScheduleChangeRequests')
    async getAllScheduleChangeRequests(data: any) {
        try {
            this.processLog('GetAllScheduleChangeRequests', data.correlationId, 'Nhận được yêu cầu lấy danh sách yêu cầu thay đổi');

            const result = await this.changeRequestsService.getAll(data);

            this.processLog('GetAllScheduleChangeRequests', data.correlationId, 'Kết thúc xử lý lấy danh sách yêu cầu thay đổi');

            return result;
        } catch (e) {
            this.processLog('GetAllScheduleChangeRequests', data.correlationId, `Lỗi khi xử lý lấy danh sách yêu cầu thay đổi: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Lấy chi tiết yêu cầu thay đổi lịch làm việc theo ID
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.id - ID của yêu cầu thay đổi
     * @param {number} data.doctorId - ID của bác sĩ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetScheduleChangeRequestById')
    async getScheduleChangeRequestById(data: any) {
        try {
            this.processLog('GetScheduleChangeRequestById', data.correlationId, 'Nhận được yêu cầu lấy yêu cầu thay đổi theo ID');

            const result = await this.changeRequestsService.getById(data);

            this.processLog('GetScheduleChangeRequestById', data.correlationId, 'Kết thúc xử lý lấy yêu cầu thay đổi theo ID');

            return result;
        } catch (e) {
            this.processLog('GetScheduleChangeRequestById', data.correlationId, `Lỗi khi xử lý lấy yêu cầu thay đổi theo ID: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Cập nhật trạng thái yêu cầu thay đổi lịch làm việc (Duyệt/Từ chối)
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.id - ID của yêu cầu thay đổi
     * @param {string} data.status - Trạng thái mới (APPROVED/REJECTED)
     * @param {string} [data.rejectedReason] - Lý do từ chối (nếu status là REJECTED)
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'UpdateScheduleChangeRequest')
    async updateScheduleChangeRequest(data: any) {
        try {
            this.processLog('UpdateScheduleChangeRequest', data.correlationId, 'Nhận được yêu cầu cập nhật yêu cầu thay đổi');

            const result = await this.changeRequestsService.update(data);

            this.processLog('UpdateScheduleChangeRequest', data.correlationId, 'Kết thúc xử lý cập nhật yêu cầu thay đổi');

            return result;
        } catch (e) {
            this.processLog('UpdateScheduleChangeRequest', data.correlationId, `Lỗi khi xử lý cập nhật yêu cầu thay đổi: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
