import { Controller, Get, HttpException, Inject, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "../schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { AccessGuard } from "src/guards/access.guard";
import { type Request } from "express";

@Controller('opening-time')
export class OpeningTimeController {
    constructor(private scheduleService: ScheduleService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
     * Lấy danh sách giờ mở cửa
     * @param {Request} req - Request object để lấy headers
     */
    @Get()
    @UseGuards(AccessGuard)
    async getOpeningTime(@Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetOpeningTime', correlationId, 'Nhận được yêu cầu lấy danh sách giờ mở cửa');

        const result = await this.scheduleService.getOpeningTime({ correlationId });

        if (!result.ok) {
            this.processLog('GetOpeningTime', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetOpeningTime', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}