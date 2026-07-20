import { Controller, Inject } from "@nestjs/common";
import { VnpayService } from "./vnpay.service";
import { ClientProxy } from "@nestjs/microservices";

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
}