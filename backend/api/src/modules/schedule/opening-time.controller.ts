import { Body, Controller, Get, HttpException, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { AccessGuard } from "src/guards/access.guard";
import { type Request } from "express";
import { Roles } from "src/decorators/roles.decorator";
import { UpdateOpeningTimeDto } from "./dtos/update-opening-time.dto";

@Controller('opening-time')
export class OpeningTimeController {
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
     * Lấy danh sách giờ mở cửa
     * @param {Request} req - Request object để lấy headers
     */
    @Get()
    @UseGuards(AccessGuard)
    async getAll(@Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAllOpeningTime', correlationId, 'Nhận được yêu cầu lấy danh sách giờ mở cửa');

        const result = await this.scheduleService.getAll({ correlationId });

        if (!result.ok) {
            this.processLog('GetAllOpeningTime', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetAllOpeningTime', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Cập nhật danh sách giờ mở cửa
     * @param {Object} body - Dữ liệu yêu cầu
     * @param {Array} body.openingTimes - Danh sách giờ mở cửa
     * @param {Request} req - Request object để lấy headers
     */
    @Patch()
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async updateBulk(@Body() body: UpdateOpeningTimeDto, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('UpdateBulkOpeningTime', correlationId, 'Nhận được yêu cầu cập nhật danh sách giờ mở cửa');

        const result = await this.scheduleService.updateBulk({ ...body, correlationId });

        if (!result.ok) {
            this.processLog('UpdateBulkOpeningTime', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('UpdateBulkOpeningTime', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}