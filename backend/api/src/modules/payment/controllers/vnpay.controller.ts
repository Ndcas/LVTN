import { Controller, Get, HttpException, Inject, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from '../payment.service';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { type Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('vnpay')
export class VnpayController {
  constructor(
    private paymentService: PaymentService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy,
    private configService: ConfigService
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
   * Tạo URL thanh toán VNPay
   * @param {number} id - ID của hóa đơn
   * @param {Request} req - Request object
   */
  @Post(':id')
  @UseGuards(AccessGuard)
  async createPaymentUrl(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreatePaymentUrl', correlationId, 'Nhận yêu cầu tạo URL thanh toán');

    const result = await this.paymentService.createPaymentUrl({
      id,
      ip: req.ip,
      correlationId
    });

    if (!result.ok) {
      this.processLog('CreatePaymentUrl', correlationId, `Thất bại: ${result.error}`, 'warn');
      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreatePaymentUrl', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Xác thực Return URL từ VNPay
   * @param {Request} req - Request object chứa query params
   */
  @Get('return')
  async validateReturnUrl(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('ValidateReturnUrl', correlationId, 'Nhận yêu cầu xác thực VNPay Return URL');

    const result = await this.paymentService.validateReturnUrl({
      query: JSON.stringify(req.query),
      correlationId
    });

    if (!result.ok) {
      this.processLog('ValidateReturnUrl', correlationId, `Thất bại: ${result.error}`, 'warn');

      return { url: this.configService.get<string>('FRONTEND_DOMAIN') + '/payment-failed' };
    }

    this.processLog('ValidateReturnUrl', correlationId, 'Thành công');

    return { url: this.configService.get<string>('FRONTEND_DOMAIN') + '/payment-success' };
  }

  /**
   * Webhook IPN từ VNPay
   * @param {Request} req - Request object chứa query params
   */
  @Get('vnpay-ipn')
  async validateIpnUrl(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('ValidateIpnUrl', correlationId, 'Nhận yêu cầu IPN từ VNPay');

    const result = await this.paymentService.validateIpnUrl({
      query: JSON.stringify(req.query),
      correlationId
    });

    this.processLog('ValidateIpnUrl', correlationId, 'Thành công');

    return result.data;
  }
}
