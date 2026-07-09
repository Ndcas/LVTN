import { Controller, Get, Post, Body, Patch, Param, Query, HttpException, UseGuards, Req, Inject, ParseIntPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { AccessGuard } from '../../guards/access.guard';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from 'src/decorators/roles.decorator';
import { type Request } from 'express';

@Controller('feedbacks')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
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
   * Lấy danh sách góp ý
   * @param {string} page - Số trang
   * @param {string} limit - Số lượng mỗi trang
   * @param {string} read - Trạng thái đã đọc (0 hoặc 1)
   * @param {Request} req - Request object để lấy headers
   */
  @UseGuards(AccessGuard)
  @Roles(["Admin"])
  @Get()
  async getAllFeedbacks(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('read') read: string,
    @Req() req: Request,
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllFeedbacks', correlationId, 'Nhận được yêu cầu lấy danh sách góp ý');

    const result: any = await this.feedbackService.getAllFeedbacks({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      read: read || undefined,
      correlationId
    });

    if (!result.ok) {
      this.processLog('GetAllFeedbacks', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllFeedbacks', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy số lượng góp ý chưa đọc
   * @param {Request} req - Request object để lấy headers
   */
  @UseGuards(AccessGuard)
  @Roles(["Admin"])
  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetUnreadCount', correlationId, 'Nhận được yêu cầu lấy số lượng góp ý chưa đọc');

    const result: any = await this.feedbackService.getUnreadCount({ correlationId });

    if (!result.ok) {
      this.processLog('GetUnreadCount', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetUnreadCount', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy chi tiết thông tin góp ý
   * @param {number} id - ID của góp ý
   * @param {Request} req - Request object để lấy headers
   */
  @UseGuards(AccessGuard)
  @Roles(["Admin"])
  @Get(':id')
  async getFeedbackById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetFeedbackById', correlationId, 'Nhận được yêu cầu lấy thông tin góp ý');

    const result: any = await this.feedbackService.getFeedbackById({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetFeedbackById', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetFeedbackById', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Tạo góp ý mới
   * @param {Object} createFeedbackDto - Dữ liệu yêu cầu
   * @param {string} createFeedbackDto.title - Tiêu đề góp ý
   * @param {string} createFeedbackDto.content - Nội dung góp ý
   * @param {Request} req - Request object để lấy headers
   */
  @UseGuards(AccessGuard)
  @Post()
  async createFeedback(@Body() createFeedbackDto: CreateFeedbackDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateFeedback', correlationId, 'Nhận được yêu cầu tạo góp ý');

    const result: any = await this.feedbackService.createFeedback({ ...createFeedbackDto, correlationId });

    if (!result.ok) {
      this.processLog('CreateFeedback', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateFeedback', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Đánh dấu góp ý đã đọc
   * @param {number} id - ID của góp ý
   * @param {Request} req - Request object để lấy headers
   */
  @UseGuards(AccessGuard)
  @Roles(["Admin"])
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('MarkAsRead', correlationId, 'Nhận được yêu cầu đánh dấu đã đọc');

    const result: any = await this.feedbackService.markAsRead({ id, correlationId });

    if (!result.ok) {
      this.processLog('MarkAsRead', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('MarkAsRead', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;
    return data;
  }
}
