import { Body, Controller, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "../schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { AccessGuard } from "src/guards/access.guard";
import { Roles } from "src/decorators/roles.decorator";
import { type Request } from "express";
import { UpdateDoctorLeaveDto } from "../dtos/update-doctor-leave.dto";
import { CreateDoctorLeaveDto } from "../dtos/create-doctor-leave.dto";

@Controller('leaves')
export class LeavesController {
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
     * Lấy danh sách đơn xin nghỉ phép của bác sĩ
     * @param {string} page - Số trang
     * @param {string} limit - Số lượng trên mỗi trang
     * @param {string} status - Trạng thái đơn xin nghỉ
     * @param {Request} req - Request object để lấy headers
     */
    @Get()
    @UseGuards(AccessGuard)
    @Roles(['Admin', 'Doctor'])
    async getAllDoctorLeaves(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('status') status: string,
        @Req() req: Request
    ) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAllDoctorLeaves', correlationId, `Nhận được yêu cầu lấy danh sách đơn xin nghỉ`);

        const result = await this.scheduleService.getAllDoctorLeave({
            doctorId: (req as any).user.roleId == 2 ? (req as any).user.userId : undefined,
            status: status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GetAllDoctorLeaves', correlationId, `Thất bại: ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetAllDoctorLeaves', correlationId, 'Thành công');

        const { ok, status: resStatus, error, ...data } = result;

        return data;
    }

    /**
     * Tạo đơn xin nghỉ phép (Dành cho bác sĩ)
     * @param {Object} body - Thông tin đơn xin nghỉ
     * @param {string} body.leaveDate - Ngày xin nghỉ (YYYY-MM-DD)
     * @param {string} body.reason - Lý do xin nghỉ
     * @param {Request} req - Request object để lấy headers
     */
    @Post()
    @UseGuards(AccessGuard)
    @Roles(['Doctor'])
    async createDoctorLeave(@Body() body: CreateDoctorLeaveDto, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('CreateDoctorLeave', correlationId, `Nhận được yêu cầu tạo đơn xin nghỉ`);

        const result = await this.scheduleService.createDoctorLeave({
            doctorId: (req as any).user.userId,
            leaveDate: body.leaveDate,
            reason: body.reason,
            correlationId
        });

        if (!result.ok) {
            this.processLog('CreateDoctorLeave', correlationId, `Thất bại: ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('CreateDoctorLeave', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Cập nhật trạng thái duyệt đơn xin nghỉ (Dành cho Admin)
     * @param {number} id - ID đơn xin nghỉ
     * @param {Object} body - Dữ liệu cập nhật
     * @param {string} body.status - Trạng thái duyệt ('APPROVED', 'REJECTED')
     * @param {string} [body.rejectedReason] - Lý do từ chối (tùy chọn)
     * @param {Request} req - Request object để lấy headers
     */
    @Patch(':id')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async updateDoctorLeave(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDoctorLeaveDto, @Req() req: Request) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('UpdateDoctorLeave', correlationId, `Nhận được yêu cầu cập nhật đơn xin nghỉ`);

        const result = await this.scheduleService.updateDoctorLeave({
            id: id,
            status: body.status,
            rejectedReason: body.rejectedReason,
            correlationId
        });

        if (!result.ok) {
            this.processLog('UpdateDoctorLeave', correlationId, `Thất bại: ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('UpdateDoctorLeave', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }
}