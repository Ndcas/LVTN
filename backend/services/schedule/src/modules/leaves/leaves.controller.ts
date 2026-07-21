import { Controller, Inject } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class LeavesController {
    constructor(private leavesService: LeavesService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
     * Lấy danh sách đơn xin nghỉ
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.page - Số trang
     * @param {number} data.limit - Số lượng trên mỗi trang
     * @param {number} data.doctorId - ID bác sĩ
     * @param {string} data.status - Trạng thái đơn xin nghỉ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetAllDoctorLeaves')
    async getAllDoctorLeaves(data: any) {
        try {
            this.processLog('GetAllDoctorLeaves', data.correlationId, `Nhận được yêu cầu lấy danh sách đơn xin nghỉ`);

            const result = await this.leavesService.getAll(data);

            this.processLog('GetAllDoctorLeaves', data.correlationId, 'Kết thúc xử lý lấy danh sách đơn xin nghỉ');

            return result;
        } catch (error) {
            this.processLog('GetAllDoctorLeaves', data.correlationId, `Lỗi khi xử lý lấy danh sách đơn xin nghỉ: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Tạo đơn xin nghỉ mới
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.doctorId - ID bác sĩ
     * @param {string} data.leaveDate - Ngày xin nghỉ (YYYY-MM-DD)
     * @param {string} data.reason - Lý do xin nghỉ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'CreateDoctorLeave')
    async createDoctorLeave(data: any) {
        try {
            this.processLog('CreateDoctorLeave', data.correlationId, `Nhận được yêu cầu tạo đơn xin nghỉ`);

            const result = await this.leavesService.create(data);

            this.processLog('CreateDoctorLeave', data.correlationId, 'Kết thúc xử lý tạo đơn xin nghỉ');

            return result;
        } catch (error) {
            this.processLog('CreateDoctorLeave', data.correlationId, `Lỗi khi xử lý tạo đơn xin nghỉ: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Cập nhật trạng thái đơn xin nghỉ
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.id - ID đơn xin nghỉ
     * @param {string} data.status - Trạng thái mới
     * @param {string} data.rejectedReason - Lý do từ chối (nếu có)
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'UpdateDoctorLeave')
    async updateDoctorLeave(data: any) {
        try {
            this.processLog('UpdateDoctorLeave', data.correlationId, `Nhận được yêu cầu cập nhật đơn xin nghỉ`);

            const result = await this.leavesService.update(data);

            this.processLog('UpdateDoctorLeave', data.correlationId, 'Kết thúc xử lý cập nhật đơn xin nghỉ');

            return result;
        } catch (error) {
            this.processLog('UpdateDoctorLeave', data.correlationId, `Lỗi khi xử lý cập nhật đơn xin nghỉ: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
