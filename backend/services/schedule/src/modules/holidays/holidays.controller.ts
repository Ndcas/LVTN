import { Controller, Inject } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class HolidaysController {
    constructor(
        private readonly holidayService: HolidaysService,
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
     * Lấy danh sách ngày lễ qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'GetAllHolidays')
    async getAll(data: any) {
        try {
            this.processLog('GetAllHolidays', data.correlationId, 'Nhận được yêu cầu lấy danh sách ngày lễ');

            const result = await this.holidayService.getAll(data);

            this.processLog('GetAllHolidays', data.correlationId, 'Kết thúc xử lý lấy danh sách ngày lễ');

            return result;
        } catch (e) {
            this.processLog('GetAllHolidays', data.correlationId, `Lỗi khi xử lý lấy danh sách ngày lễ: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Tạo ngày lễ mới qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {string} data.holidayDate - Ngày lễ
     * @param {string} data.name - Tên ngày lễ
     * @param {string} [data.description] - Mô tả ngày lễ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'CreateHoliday')
    async create(data: any) {
        try {
            this.processLog('CreateHoliday', data.correlationId, 'Nhận được yêu cầu tạo ngày lễ');

            const result = await this.holidayService.create(data);

            this.processLog('CreateHoliday', data.correlationId, 'Kết thúc xử lý tạo ngày lễ');

            return result;
        } catch (e) {
            this.processLog('CreateHoliday', data.correlationId, `Lỗi khi xử lý tạo ngày lễ: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Cập nhật ngày lễ qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.id - ID của ngày lễ
     * @param {string} [data.name] - Tên ngày lễ
     * @param {string} [data.description] - Mô tả ngày lễ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'UpdateHoliday')
    async update(data: any) {
        try {
            this.processLog('UpdateHoliday', data.correlationId, 'Nhận được yêu cầu cập nhật ngày lễ');

            const result = await this.holidayService.update(data);

            this.processLog('UpdateHoliday', data.correlationId, 'Kết thúc xử lý cập nhật ngày lễ');

            return result;
        } catch (e) {
            this.processLog('UpdateHoliday', data.correlationId, `Lỗi khi xử lý cập nhật ngày lễ: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Xóa ngày lễ qua gRPC
     * @param {Object} data - Dữ liệu yêu cầu
     * @param {number} data.id - ID của ngày lễ
     * @param {string} data.correlationId - ID theo dõi request
     */
    @GrpcMethod('ScheduleService', 'DeleteHoliday')
    async delete(data: any) {
        try {
            this.processLog('DeleteHoliday', data.correlationId, 'Nhận được yêu cầu xóa ngày lễ');

            const result = await this.holidayService.remove(data);

            this.processLog('DeleteHoliday', data.correlationId, 'Kết thúc xử lý xóa ngày lễ');

            return result;
        } catch (e) {
            this.processLog('DeleteHoliday', data.correlationId, `Lỗi khi xử lý xóa ngày lễ: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
