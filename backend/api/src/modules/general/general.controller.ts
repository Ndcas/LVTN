import { Controller, Get, HttpException, Inject, Query, Req, UseGuards } from "@nestjs/common";
import { GeneralService } from "./general.service";
import { type Request } from "express";
import { AccessGuard } from "src/guards/access.guard";
import { Roles } from "src/decorators/roles.decorator";
import { ClientProxy } from "@nestjs/microservices";

@Controller('general')
export class GeneralController {
    constructor(private generalService: GeneralService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
     * Lấy thông tin admin dashboard
     * @param {string} forceRefresh - Buộc làm mới dữ liệu
     * @param {Request} req - Request object để lấy headers
     */
    @Get('admin-dashboard')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async getAdminDashboardData(@Query('forceRefresh') forceRefresh: string, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAdminDashboardData', correlationId, 'Nhận được yêu cầu lấy thông tin admin dashboard');

        const result: any = await this.generalService.getAdminDashboardData({
            forceRefresh: forceRefresh ? true : false,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GetAdminDashboardData', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetAdminDashboardData', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}