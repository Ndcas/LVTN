import { BadRequestException, Controller, Get, HttpException, Inject, ParseIntPipe, Query, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { type Request } from "express";
import { AccessGuard } from "src/guards/access.guard";

@Controller('time-slots')
export class TimeSlotsController {
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
        @Query('startTime') startTime: string,
        @Query('endTime') endTime: string,
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

        try {
            startTime = this.formatTimeString(startTime);
            endTime = this.formatTimeString(endTime);
        } catch (error) {
            throw new BadRequestException('Thời gian sai định dạng');
        }

        if (this.timeStringToSeconds(startTime) >= this.timeStringToSeconds(endTime)) {
            throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
        }

        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAvailableTimeSlots', correlationId, 'Nhận được yêu cầu lấy timeslot trống');

        const result = await this.scheduleService.getAvailableTimeSlots({
            date,
            specialtyId,
            startTime,
            endTime,
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

    private formatTimeString(time: string) {
        const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!regex.test(time)) {
            throw new Error('Thời gian sai định dạng');
        }

        return time + ':00';
    }

    private timeStringToSeconds(time: string) {
        const [hours, minutes, seconds] = time.split(':').map(s => parseInt(s));

        return hours * 3600 + minutes * 60 + seconds;
    }
}