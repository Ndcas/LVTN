import { BadRequestException, Body, Controller, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ScheduleService } from "../schedule.service";
import { ClientProxy } from "@nestjs/microservices";
import { Roles } from "src/decorators/roles.decorator";
import { type Request } from "express";
import { AccessGuard } from "src/guards/access.guard";
import { CreateChangeRequestDto } from "../dtos/create-change-request.dto";
import { UpdateChangeRequestStatusDto } from "../dtos/update-change-request-status.dto";

@Controller('change-requests')
export class ChangeRequestsController {
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
     * Lấy danh sách yêu cầu thay đổi lịch trình
     * @param {string} page - Trang hiện tại
     * @param {string} limit - Số lượng trên mỗi trang
     * @param {string} status - Trạng thái yêu cầu (PENDING/APPROVED/REJECTED)
     * @param {Request} req - Request object để lấy headers và user
     */
    @Get()
    @UseGuards(AccessGuard)
    @Roles(['Admin', 'Doctor'])
    async getAllChangeRequests(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('status') status: string,
        @Req() req: Request
    ) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetAllChangeRequests', correlationId, 'Nhận được yêu cầu lấy danh sách thay đổi lịch trình');

        const result = await this.scheduleService.getAllScheduleChangeRequests({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            doctorId: (req as any).user.roleId == 2 ? (req as any).user.userId : undefined,
            status: status,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GetAllChangeRequests', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetAllChangeRequests', correlationId, 'Thành công');

        const { ok, status: resultStatus, error, ...data } = result;

        return data;
    }

    /**
     * Lấy thông tin chi tiết yêu cầu thay đổi lịch trình theo ID
     * @param {number} id - ID của yêu cầu thay đổi
     * @param {Request} req - Request object để lấy headers và user
     */
    @Get(':id')
    @UseGuards(AccessGuard)
    @Roles(['Admin', 'Doctor'])
    async getChangeRequestById(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request
    ) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('GetChangeRequestById', correlationId, 'Nhận được yêu cầu lấy thông tin thay đổi lịch trình');

        const result = await this.scheduleService.getScheduleChangeRequestById({
            id,
            doctorId: (req as any).user.roleId == 2 ? (req as any).user.userId : undefined,
            correlationId
        });

        if (!result.ok) {
            this.processLog('GetChangeRequestById', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('GetChangeRequestById', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Tạo yêu cầu thay đổi lịch trình làm việc
     * @param {CreateChangeRequestDto} body - Dữ liệu tạo yêu cầu bao gồm danh sách lịch làm việc
     * @param {Request} req - Request object để lấy headers và user (lấy doctorId)
     */
    @Post()
    @UseGuards(AccessGuard)
    @Roles(['Doctor'])
    async createChangeRequest(
        @Body() body: CreateChangeRequestDto,
        @Req() req: Request
    ) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('CreateChangeRequest', correlationId, 'Nhận được yêu cầu tạo thay đổi lịch trình');

        const detailMap = new Map();

        for (const detail of body.details) {
            const calculatedDetail = {
                dayOfWeek: detail.dayOfWeek,
                startTime: this.timeToSeconds(detail.startTime),
                endTime: this.timeToSeconds(detail.endTime)
            }

            if (calculatedDetail.startTime >= calculatedDetail.endTime) {
                this.processLog('CreateChangeRequest', correlationId, 'Thời gian bắt đầu không hợp lệ', 'warn');

                throw new BadRequestException('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
            }

            if (!detailMap.has(calculatedDetail.dayOfWeek)) {
                detailMap.set(calculatedDetail.dayOfWeek, []);
            }

            if (detailMap
                .get(calculatedDetail.dayOfWeek)
                .some(d => calculatedDetail.startTime < d.endTime && calculatedDetail.endTime > d.startTime)) {
                this.processLog('CreateChangeRequest', correlationId, 'Thời gian làm việc không được trùng lặp', 'warn');

                throw new BadRequestException('Thời gian làm việc không được trùng lặp nhau trong cùng một ngày');
            };

            detailMap.get(calculatedDetail.dayOfWeek).push(calculatedDetail);
        }

        const result = await this.scheduleService.createScheduleChangeRequest({
            ...body,
            doctorId: (req as any).user.userId,
            correlationId
        });

        if (!result.ok) {
            this.processLog('CreateChangeRequest', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('CreateChangeRequest', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    /**
     * Cập nhật trạng thái yêu cầu thay đổi lịch trình (Duyệt/Từ chối)
     * @param {number} id - ID của yêu cầu thay đổi
     * @param {UpdateChangeRequestStatusDto} body - Dữ liệu trạng thái và lý do từ chối
     * @param {Request} req - Request object để lấy headers
     */
    @Patch(':id')
    @UseGuards(AccessGuard)
    @Roles(['Admin'])
    async updateChangeRequestStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateChangeRequestStatusDto,
        @Req() req: Request
    ) {
        const correlationId = req.headers['correlation-id'] as string;

        this.processLog('UpdateChangeRequestStatus', correlationId, 'Nhận được yêu cầu cập nhật trạng thái thay đổi lịch trình');

        const result = await this.scheduleService.updateScheduleChangeRequest({ ...body, id, correlationId });

        if (!result.ok) {
            this.processLog('UpdateChangeRequestStatus', correlationId, `Không thành công ${result.error}`, 'warn');

            throw new HttpException(result.error, result.status);
        }

        this.processLog('UpdateChangeRequestStatus', correlationId, 'Thành công');

        const { ok, status, error, ...data } = result;

        return data;
    }

    private timeToSeconds(time: string) {
        const [hours, minutes, seconds] = time.split(':').map(Number);

        return hours * 3600 + minutes * 60 + seconds;
    }
}