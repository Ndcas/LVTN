import { Controller, Inject } from "@nestjs/common";
import { VnpayService } from "./vnpay.service";
import { ClientProxy, GrpcMethod } from "@nestjs/microservices";

@Controller()
export class VnpayController {
    constructor(private paymentService: VnpayService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
     * Tạo URL thanh toán VNPay
     * @param {Object} data
     * @param {number} data.id - ID của hóa đơn
     * @param {string} data.ip - IP của client
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'CreatePaymentUrl')
    async createPaymentUrl(data: any) {
        try {
            this.processLog('CreatePaymentUrl', data.correlationId, `Nhận yêu cầu tạo URL thanh toán cho hóa đơn: ${data.id}`);

            const result = await this.paymentService.createTransaction(data);

            this.processLog('CreatePaymentUrl', data.correlationId, 'Hoàn thành tạo URL thanh toán');

            return result;
        } catch (error) {
            this.processLog('CreatePaymentUrl', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Xác thực URL trả về từ VNPay (Frontend)
     * @param {Object} data
     * @param {string} data.query - JSON string của query params từ VNPay (truyền từ API Gateway)
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'ValidateReturnUrl')
    async validateReturnUrl(data: any) {
        try {
            this.processLog('ValidateReturnUrl', data.correlationId, 'Nhận yêu cầu xác thực VNPay Return URL');

            data.query = JSON.parse(data.query);

            const result = await this.paymentService.validateFrontend(data);

            this.processLog('ValidateReturnUrl', data.correlationId, 'Hoàn thành xác thực VNPay Return URL');

            return result;
        } catch (error) {
            this.processLog('ValidateReturnUrl', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: false,
                status: 500,
                error: 'Lỗi hệ thống'
            };
        }
    }

    /**
     * Xác thực Webhook từ VNPay (Backend IPN)
     * @param {Object} data
     * @param {string} data.query - JSON string của query params từ VNPay (truyền từ API Gateway)
     * @param {string} data.correlationId
     */
    @GrpcMethod('PaymentService', 'ValidateIpnUrl')
    async validateIpnUrl(data: any) {
        try {
            this.processLog('ValidateIpnUrl', data.correlationId, 'Nhận yêu cầu xác thực VNPay IPN URL');

            data.query = JSON.parse(data.query);

            const result = await this.paymentService.validateBackend(data);

            this.processLog('ValidateIpnUrl', data.correlationId, 'Hoàn thành xác thực VNPay IPN URL');

            return result;
        } catch (error) {
            this.processLog('ValidateIpnUrl', data.correlationId, `Lỗi: ${error}`, 'error');

            return {
                ok: true,
                status: 200,
                data: {
                    RspCode: '99',
                    Message: 'Lỗi hệ thống'
                }
            };
        }
    }
}