import { Controller, Get, HttpException, Inject, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from '../medical-record.service';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { type Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('records')
export class RecordsController {
  constructor(private medicalRecordService: MedicalRecordService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
   * Lấy danh sách lịch sử khám của bản thân
   * @param {string} page - Trang hiện tại
   * @param {string} limit - Số lượng hiển thị
   */
  @Get()
  @UseGuards(AccessGuard)
  @Roles(['Patient'])
  async getMyRecords(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetMyRecords', correlationId, `Nhận yêu cầu lấy lịch sử khám của bản thân`);

    const result = await this.medicalRecordService.getRecordsByPatient({
      id: (req as any).user.userId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      correlationId
    });

    if (!result.ok) {
      this.processLog('GetMyRecords', correlationId, `Lỗi: ${result.error}`, 'error');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetMyRecords', correlationId, 'Kết thúc xử lý lấy lịch sử khám của bản thân');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy danh sách lịch sử khám của bệnh nhân
   * @param {number} id - ID của bệnh nhân
   * @param {string} page - Trang hiện tại
   * @param {string} limit - Số lượng hiển thị
   */
  @Get('patient/:id')
  @UseGuards(AccessGuard)
  @Roles(['Doctor'])
  async getRecordsByPatient(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetRecordsByPatient', correlationId, `Nhận yêu cầu lấy lịch sử khám của bệnh nhân: ${id}`);

    const result = await this.medicalRecordService.getRecordsByPatient({
      id,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      correlationId
    });

    if (!result.ok) {
      this.processLog('GetRecordsByPatient', correlationId, `Lỗi: ${result.error}`, 'error');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetRecordsByPatient', correlationId, 'Kết thúc xử lý lấy lịch sử khám của bệnh nhân');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy bệnh án theo booking id
   * @param {number} id - ID của booking
   */
  @Get('booking/:id')
  @UseGuards(AccessGuard)
  async getRecordByBooking(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetRecordByBooking', correlationId, `Nhận yêu cầu lấy bệnh án theo booking: ${id}`);

    const result = await this.medicalRecordService.getRecordByBooking({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetRecordByBooking', correlationId, `Lỗi: ${result.error}`, 'error');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetRecordByBooking', correlationId, 'Kết thúc xử lý lấy bệnh án');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
