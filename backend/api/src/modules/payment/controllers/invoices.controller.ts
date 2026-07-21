import { Body, Controller, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from '../payment.service';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { type Request } from 'express';

@Controller('invoices')
export class InvoicesController {
  constructor(private paymentService: PaymentService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'api_gateway',
      correlationId: correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  @Get()
  @UseGuards(AccessGuard)
  @Roles(['Admin', 'Nurse'])
  async getAllInvoices(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
    @Query('patientId') patientId: string,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllInvoices', correlationId, 'Nhận yêu cầu lấy danh sách hóa đơn');

    const result = await this.paymentService.getAllInvoices({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      patientId: parseInt(patientId) || undefined,
      correlationId
    });

    if (!result.ok) {
      this.processLog('GetAllInvoices', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllInvoices', correlationId, 'Thành công');

    const { ok, status: statusCode, error, ...data } = result;

    return data;
  }

  @Get(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin', 'Nurse', 'Patient'])
  async getInvoiceById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetInvoiceById', correlationId, 'Nhận yêu cầu lấy chi tiết hóa đơn');

    const result = await this.paymentService.getInvoiceById({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetInvoiceById', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetInvoiceById', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  @Patch(':id/cash-paid')
  @UseGuards(AccessGuard)
  @Roles(['Nurse'])
  async markCashPaid(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('MarkCashPaid', correlationId, 'Nhận yêu cầu đánh dấu thanh toán tiền mặt');

    const result = await this.paymentService.markCashPaid({
      id,
      cashierId: (req as any).user.userId,
      correlationId
    });

    if (!result.ok) {
      this.processLog('MarkCashPaid', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('MarkCashPaid', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
