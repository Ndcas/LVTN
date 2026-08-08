import { BadRequestException, Controller, Delete, Get, HttpException, Inject, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "../schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { type Request } from "express";
import { AccessGuard } from "src/guards/access.guard";
import { Roles } from "src/decorators/roles.decorator";

@Controller('time-slots')
export class TimeSlotsController {
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
     * Lấy danh sách ca khám trống
     * @param {string} date - Ngày khám (YYYY-MM-DD)
     * @param {number} specialtyId - ID chuyên khoa
     * @param {string} startTime - Khung giờ bắt đầu (HH:MM)
     * @param {string} endTime - Khung giờ kết thúc (HH:MM)
     * @param {string} clinicType - Loại hình khám (ONLINE/OFFLINE)
     * @param {Request} req - Request object để lấy headers
     */
    @Get('available')
    @UseGuards(AccessGuard)
    async getAvailableTimeSlots(
        @Query('date') date: string,
        @Query('specialtyId', ParseIntPipe) specialtyId: number,
        @Query('clinicType') clinicType: string,
        @Req() req: Request
    ) {
        if (new Date(date).toString() == 'Invalid Date') {
            throw new BadRequestException('Ngày không hợp lệ');
        }

        if (!specialtyId || specialtyId <= 0) {
            throw new BadRequestException('Chuyên khoa không hợp lệ');
        }

        const clinicTypes = ['OFFLINE', 'ONLINE'];

        if (!clinicType || !clinicTypes.includes(clinicType)) {
            throw new BadRequestException('Loại hình không hợp lệ');
        }

        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAvailableTimeSlots', correlationId, 'Nhận được yêu cầu lấy timeslot trống');

        const result = await this.scheduleService.getAvailableTimeSlots({
            date,
            specialtyId,
            clinicType,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GetAvailableTimeSlots', correlationId, 'Thất bại', 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetAvailableTimeSlots', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Lên lịch khám đến chủ nhật tiếp theo
     * @param {Request} req - Request object để lấy headers
     */
    @Post('schedule-time-slots')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async scheduleTimeSlots(@Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('ScheduleTimeSlots', correlationId, 'Nhận được yêu cầu lên lịch khám');

        const result = await this.scheduleService.scheduleTimeSlots({ correlationId });

        if (!result.ok) {
            this.processLog('ScheduleTimeSlots', correlationId, 'Thất bại', 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('ScheduleTimeSlots', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Xóa time slot cũ
     * @param {Request} req - Request object để lấy headers
     */
    @Delete('delete-old-time-slots')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async deleteOldTimeSlots(@Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('DeleteOldTimeSlots', correlationId, 'Nhận được yêu cầu xóa time slot cũ');

        const result = await this.scheduleService.deleteOldTimeSlots({ correlationId });

        if (!result.ok) {
            this.processLog('DeleteOldTimeSlots', correlationId, 'Thất bại', 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('DeleteOldTimeSlots', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}