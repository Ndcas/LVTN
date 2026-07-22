import { Controller, Inject } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { ClientProxy, GrpcMethod } from "@nestjs/microservices";

@Controller()
export class InvoicesController {
    constructor(private invoicesService: InvoicesService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

    private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
        this.logClient.emit('system_log', {
            level: level,
            message: `${action} ${info}`,
            service: 'payment_service',
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Lấy danh sách hóa đơn
     * @param {Object} data
     * @param {number} [data.page=1]
     * @param {number} [data.limit=10]
     * @param {string} [data.status]
     * @param {number} [data.patientId]
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'GetAllInvoices')
    async getAllInvoices(data: any) {
        try {
            this.processLog('GetAllInvoices', data.correlationId, 'Nhận yêu cầu lấy danh sách hóa đơn');

            const result = await this.invoicesService.getAll(data);

            this.processLog('GetAllInvoices', data.correlationId, 'Hoàn thành lấy danh sách hóa đơn');

            return result;
        } catch (error) {
            this.processLog('GetAllInvoices', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Lấy chi tiết hóa đơn theo id
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'GetInvoiceById')
    async getInvoiceById(data: any) {
        try {
            this.processLog('GetInvoiceById', data.correlationId, `Nhận yêu cầu lấy hóa đơn theo ID: ${data.id}`);

            const result = await this.invoicesService.getById(data);

            this.processLog('GetInvoiceById', data.correlationId, 'Hoàn thành lấy hóa đơn');

            return result;
        } catch (error) {
            this.processLog('GetInvoiceById', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Tạo hóa đơn mới
     * @param {Object} data
     * @param {number} data.bookingId
     * @param {number} data.patientId
     * @param {number} data.examinationFee
     * @param {number} data.medicineFee
     * @param {number} data.totalAmount
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'CreateInvoice')
    async createInvoice(data: any) {
        try {
            this.processLog('CreateInvoice', data.correlationId, 'Nhận yêu cầu tạo hóa đơn mới');

            const result = await this.invoicesService.createInvoice(data);

            this.processLog('CreateInvoice', data.correlationId, 'Hoàn thành tạo hóa đơn');

            return result;
        } catch (error) {
            this.processLog('CreateInvoice', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Xác nhận thanh toán hóa đơn bằng tiền mặt
     * @param {Object} data
     * @param {number} data.id
     * @param {number} data.cashierId
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'MarkCashPaid')
    async markCashPaid(data: any) {
        try {
            this.processLog('MarkCashPaid', data.correlationId, `Nhận yêu cầu xác nhận thanh toán tiền mặt cho hóa đơn: ${data.id}`);

            const result = await this.invoicesService.markCashPaid(data);

            this.processLog('MarkCashPaid', data.correlationId, 'Hoàn thành xác nhận thanh toán tiền mặt');

            return result;
        } catch (error) {
            this.processLog('MarkCashPaid', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Xóa hóa đơn (Dùng cho Saga Rollback)
     * @param {Object} data
     * @param {number} data.id
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'DeleteInvoice')
    async deleteInvoice(data: any) {
        try {
            this.processLog('DeleteInvoice', data.correlationId, `Nhận yêu cầu xóa hóa đơn: ${data.id}`);

            const result = await this.invoicesService.deleteInvoice(data);

            this.processLog('DeleteInvoice', data.correlationId, 'Hoàn thành xóa hóa đơn');

            return result;
        } catch (error) {
            this.processLog('DeleteInvoice', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }
}