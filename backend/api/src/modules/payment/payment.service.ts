import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface PaymentServiceClient {
  // === Invoices ===
  getAllInvoices(data: any): Observable<any>;
  getInvoiceById(data: any): Observable<any>;
  markCashPaid(data: any): Observable<any>;

  // === PaymentTransaction ===
  createPaymentUrl(data: any): Observable<any>;
  validateReturnUrl(data: any): Observable<any>;
  validateIpnUrl(data: any): Observable<any>;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentService: PaymentServiceClient;

  constructor(@Inject('PAYMENT_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.paymentService = this.client.getService<PaymentServiceClient>('PaymentService');
  }

  // === Invoices ===
  getAllInvoices(data: any) {
    return lastValueFrom(this.paymentService.getAllInvoices(data));
  }

  getInvoiceById(data: any) {
    return lastValueFrom(this.paymentService.getInvoiceById(data));
  }

  markCashPaid(data: any) {
    return lastValueFrom(this.paymentService.markCashPaid(data));
  }

  // === PaymentTransaction ===
  createPaymentUrl(data: any) {
    return lastValueFrom(this.paymentService.createPaymentUrl(data));
  }

  validateReturnUrl(data: any) {
    return lastValueFrom(this.paymentService.validateReturnUrl(data));
  }

  validateIpnUrl(data: any) {
    return lastValueFrom(this.paymentService.validateIpnUrl(data));
  }
}
