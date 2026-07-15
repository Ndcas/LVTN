import { Body, Controller, Delete, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { AccessGuard } from "src/guards/access.guard";
import { type Request } from "express";
import { CreateHolidayDto } from "./dtos/create-holiday.dto";
import { Roles } from "src/decorators/roles.decorator";
import { UpdateHolidayDto } from "./dtos/update-holiday.dto";

@Controller('holidays')
export class HolidaysController {
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
     * Lấy danh sách ngày lễ
     * @param {Request} req - Request object để lấy headers
     */
    @Get()
    @UseGuards(AccessGuard)
    async getAllHolidays(@Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAllHolidays', correlationId, 'Nhận được yêu cầu lấy danh sách ngày lễ');

        const result = await this.scheduleService.getAllHolidays({ correlationId });

        if (!result.ok) {
            this.processLog('GetAllHolidays', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetAllHolidays', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Tạo ngày lễ mới
     * @param {Object} body - Dữ liệu ngày lễ mới
     * @param {string} body.holidayDate - Ngày lễ
     * @param {string} body.name - Tên ngày lễ
     * @param {string} [body.description] - Mô tả ngày lễ
     * @param {Request} req - Request object để lấy headers
     */
    @Post()
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async createHoliday(@Body() body: CreateHolidayDto, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('CreateHoliday', correlationId, 'Nhận được yêu cầu tạo ngày lễ');

        const result = await this.scheduleService.createHoliday({ ...body, correlationId });

        if (!result.ok) {
            this.processLog('CreateHoliday', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('CreateHoliday', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Cập nhật ngày lễ
     * @param {number} id - ID của ngày lễ
     * @param {Object} body - Dữ liệu cần cập nhật
     * @param {string} [body.name] - Tên ngày lễ
     * @param {string} [body.description] - Mô tả ngày lễ
     * @param {Request} req - Request object để lấy headers
     */
    @Patch(':id')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async updateHoliday(@Body() body: UpdateHolidayDto, @Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('UpdateHoliday', correlationId, 'Nhận được yêu cầu cập nhật ngày lễ');

        const result = await this.scheduleService.updateHoliday({ ...body, id, correlationId });

        if (!result.ok) {
            this.processLog('UpdateHoliday', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('UpdateHoliday', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Xóa ngày lễ
     * @param {number} id - ID của ngày lễ
     * @param {Request} req - Request object để lấy headers
     */
    @Delete(':id')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async deleteHoliday(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('DeleteHoliday', correlationId, 'Nhận được yêu cầu xóa ngày lễ');

        const result = await this.scheduleService.deleteHoliday({ id, correlationId });

        if (!result.ok) {
            this.processLog('DeleteHoliday', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('DeleteHoliday', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}