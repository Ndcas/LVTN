import { Controller, Inject } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { ClientProxy } from "@nestjs/microservices";

@Controller('bookings')
export class BookingsController {
    constructor(
        private readonly scheduleService: ScheduleService,
        @Inject('LOG_SERVICE') private logClient: ClientProxy
    ) { }

    private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
        this.logClient.emit('system_log', {
            level: level,
            message: `${action} ${info}`,
            service: 'api_gateway',
            correlationId: correlationId,
            timestamp: new Date().toISOString(),
        });
    }
}