import { Controller, Get, HttpException, Inject, Param, ParseIntPipe, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { AccessGuard } from "src/guards/access.guard";
import { type Request } from "express";
import { Roles } from "src/decorators/roles.decorator";

@Controller('templates')
export class TemplatesController {
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

    /**
     * Lấy lịch làm việc mẫu của bác sĩ
     * @param {number} id - ID của bác sĩ
     * @param {Request} req - Request object để lấy headers
     */
    @Get(':id')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async getWeeklyTemplateByDoctor(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetWeeklyTemplateByDoctor', correlationId, 'Nhận được yêu cầu lấy lịch làm việc mẫu của bác sĩ');

        const result = await this.scheduleService.getWeeklyTemplateByDoctor({ id, correlationId });

        if (!result.ok) {
            this.processLog('GetWeeklyTemplateByDoctor', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetWeeklyTemplateByDoctor', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Lấy lịch làm việc mẫu của tôi
     * @param {Request} req - Request object để lấy headers
     */
    @Get()
    @UseGuards(AccessGuard)
    @Roles(['Doctor'])
    async getWeeklyTemplate(@Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetWeeklyTemplate', correlationId, 'Nhận được yêu cầu lấy lịch làm việc mẫu của tôi');

        const result = await this.scheduleService.getWeeklyTemplateByDoctor({
            id: (req as any).user.userId,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GetWeeklyTemplate', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetWeeklyTemplate', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}