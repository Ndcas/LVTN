import { Controller, Inject } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller('opening-time')
export class HolidaysController {
    constructor(
        private readonly openingTimeService: HolidaysService,
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
}
