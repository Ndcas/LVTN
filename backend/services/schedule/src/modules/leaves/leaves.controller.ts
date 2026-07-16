import { Controller, Inject } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { ClientProxy, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class LeavesController {
    constructor(
        private readonly leavesService: LeavesService,
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
