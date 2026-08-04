import { Body, Controller, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "../schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { AccessGuard } from "src/guards/access.guard";
import { Roles } from "src/decorators/roles.decorator";
import { type Request } from "express";
import { FinishBookingDto } from "../dtos/finish-booking.dto";

@Controller('bookings')
export class BookingsController {
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
     * Lấy danh sách lịch hẹn
     * @param {string} page - Số trang
     * @param {string} limit - Số lượng trên mỗi trang
     * @param {string} status - Trạng thái lịch hẹn
     * @param {Request} req - Request object để lấy headers
     */
    @Get()
    @UseGuards(AccessGuard)
    @Roles(['Patient', 'Doctor'])
    async getAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('status') status: string,
        @Req() req: Request
    ) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAllBookings', correlationId, 'Nhận được yêu cầu lấy danh sách lịch hẹn');

        const response = await this.scheduleService.getAllBookings({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            status,
            userId: (req as any).user.userId,
            roleId: (req as any).user.roleId,
            correlationId
        });

        if (!response.ok) {
            this.processLog('GetAllBookings', correlationId, `Không thành công ${response.error}`, 'warn');

            throw new HttpException(response.error, response.status);
        }

        this.processLog('GetAllBookings', correlationId, 'Thành công');

        const { ok, status: resStatus, error, ...data } = response;

        return data;
    }

    /**
     * Lấy chi tiết lịch hẹn theo ID
     * @param {number} id - ID lịch hẹn
     * @param {Request} req - Request object để lấy headers
     */
    @Get(':id')
    @UseGuards(AccessGuard)
    @Roles(['Patient', 'Doctor'])
    async getBookingById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetBookingById', correlationId, 'Nhận được yêu cầu lấy chi tiết lịch hẹn');

        const response = await this.scheduleService.getBookingById({
            id,
            correlationId,
            userId: (req as any).user.userId
        });

        if (!response.ok) {
            this.processLog('GetBookingById', correlationId, `Không thành công ${response.error}`, 'warn');

            throw new HttpException(response.error, response.status);
        }

        this.processLog('GetBookingById', correlationId, 'Thành công');

        const { ok, status, error, ...data } = response;

        return data;
    }

    /**
     * Tạo lịch hẹn mới
     * @param {number} id - ID ca khám (time slot)
     * @param {Request} req - Request object để lấy headers
     */
    @Post(':id')
    @UseGuards(AccessGuard)
    @Roles(['Patient'])
    async createBooking(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('CreateBooking', correlationId, 'Nhận được yêu cầu tạo lịch hẹn');

        const result = await this.scheduleService.createBooking({
            timeSlotId: id,
            patientId: (req as any).user.userId,
            correlationId
        });

        if (!result.ok) {
            this.processLog('CreateBooking', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('CreateBooking', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Hủy lịch hẹn
     * @param {number} id - ID lịch hẹn
     * @param {Request} req - Request object để lấy headers
     */
    @Patch('cancel/:id')
    @UseGuards(AccessGuard)
    @Roles(['Patient'])
    async cancelBooking(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('CancelBooking', correlationId, 'Nhận được yêu cầu hủy lịch hẹn');

        const result = await this.scheduleService.updateBookingStatus({
            bookingId: id,
            userId: (req as any).user.userId,
            status: 'CANCELED',
            correlationId
        });

        if (!result.ok) {
            this.processLog('CancelBooking', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('CancelBooking', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Hoàn thành lịch hẹn
     * @param {number} id - ID lịch hẹn
     * @param {Request} req - Request object để lấy headers
     */
    @Patch('finish/:id')
    @UseGuards(AccessGuard)
    @Roles(['Doctor'])
    async finishBooking(@Param('id', ParseIntPipe) id: number, @Body() body: FinishBookingDto, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('FinishBooking', correlationId, 'Nhận được yêu cầu hoàn thành lịch hẹn');

        const result = await this.scheduleService.finishBooking({
            ...body,
            bookingId: id,
            doctorId: (req as any).user.userId,
            correlationId
        });

        if (!result.ok) {
            this.processLog('FinishBooking', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('FinishBooking', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Đánh dấu bệnh nhân không đến
     * @param {number} id - ID lịch hẹn
     * @param {Request} req - Request object để lấy headers
     */
    @Patch('no-show/:id')
    @UseGuards(AccessGuard)
    @Roles(['Doctor'])
    async markNoShowBooking(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('MarkNoShowBooking', correlationId, 'Nhận được yêu cầu đánh dấu không đến');

        const result = await this.scheduleService.updateBookingStatus({
            bookingId: id,
            userId: (req as any).user.userId,
            status: 'NO_SHOW',
            correlationId
        });

        if (!result.ok) {
            this.processLog('MarkNoShowBooking', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('MarkNoShowBooking', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Lấy mã token video call
     * @param {number} id - ID lịch hẹn
     * @param {Request} req - Request object để lấy headers
     */
    @Get('video-call/:id')
    @UseGuards(AccessGuard)
    @Roles(['Patient', 'Doctor'])
    async generateVideoCallId(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GenerateVideoCallId', correlationId, 'Nhận được yêu cầu tạo ID cuộc gọi video call');

        const result = await this.scheduleService.generateVideoCallId({
            bookingId: id,
            userId: (req as any).user.userId,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GenerateVideoCallId', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GenerateVideoCallId', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}