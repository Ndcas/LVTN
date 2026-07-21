import { Controller, Inject } from '@nestjs/common';
import { RecordsService } from './records.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class RecordsController {
    constructor(private recordsService: RecordsService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

    private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
        this.logClient.emit('system_log', {
            level: level,
            message: `${action} ${info}`,
            service: 'medicalrecord_service',
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Lấy bệnh án theo booking_id
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.correlationId
     */
    @GrpcMethod('MedicalRecordService', 'GetRecordByBooking')
    async getRecordByBooking(data: any) {
        try {
            this.processLog('GetRecordByBooking', data.correlationId, 'Nhận yêu cầu lấy bệnh án theo booking');

            const result = await this.recordsService.getByBooking(data);

            this.processLog('GetRecordByBooking', data.correlationId, 'Kết thúc xử lý lấy bệnh án theo booking');

            return result;
        } catch (e) {
            this.processLog('GetRecordByBooking', data.correlationId, `Lỗi khi xử lý lấy bệnh án theo booking: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Lấy lịch sử khám theo patient_id
     * @param {Object} data
     * @param {number} data.id
     * @param {number} [data.page=1]
     * @param {number} [data.limit=10]
     * @param {string} data.correlationId
     */
    @GrpcMethod('MedicalRecordService', 'GetRecordsByPatient')
    async getRecordsByPatient(data: any) {
        try {
            this.processLog('GetRecordsByPatient', data.correlationId, 'Nhận yêu cầu lấy lịch sử khám của bệnh nhân');

            const result = await this.recordsService.getByPatient(data);

            this.processLog('GetRecordsByPatient', data.correlationId, 'Kết thúc xử lý lấy lịch sử khám của bệnh nhân');

            return result;
        } catch (e) {
            this.processLog('GetRecordsByPatient', data.correlationId, `Lỗi khi xử lý lấy lịch sử khám của bệnh nhân: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Tạo bệnh án mới (gồm Prescription và Details)
     * @param {Object} data
     * @param {number} data.bookingId
     * @param {number} data.patientId
     * @param {number} data.doctorId
     * @param {string} data.visitDate
     * @param {string} data.clinicalIndicators
     * @param {number} data.diseaseId
     * @param {string} data.diagnoseDetail
     * @param {Array} data.prescriptionDetails - [{ medicineId, quantity, dosage }]
     * @param {string} data.correlationId
     */
    @GrpcMethod('MedicalRecordService', 'CreateRecord')
    async createRecord(data: any) {
        try {
            this.processLog('CreateRecord', data.correlationId, 'Nhận yêu cầu tạo bệnh án mới');

            const result = await this.recordsService.create(data);

            this.processLog('CreateRecord', data.correlationId, 'Kết thúc xử lý tạo bệnh án mới');

            return result;
        } catch (e) {
            this.processLog('CreateRecord', data.correlationId, `Lỗi khi xử lý tạo bệnh án mới: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
    /**
     * Xóa bệnh án (chủ yếu dùng nếu có sai sót nghiêm trọng hoặc test)
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.correlationId
     */
    @GrpcMethod('MedicalRecordService', 'DeleteRecord')
    async deleteRecord(data: any) {
        try {
            this.processLog('DeleteRecord', data.correlationId, `Nhận yêu cầu xóa bệnh án id: ${data.id}`);

            const result = await this.recordsService.delete(data);

            this.processLog('DeleteRecord', data.correlationId, `Kết thúc xử lý xóa bệnh án id: ${data.id}`);

            return result;
        } catch (e) {
            this.processLog('DeleteRecord', data.correlationId, `Lỗi khi xử lý xóa bệnh án: ${e}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}
