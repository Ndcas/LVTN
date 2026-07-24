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

interface UserServiceClient {
  getAllUserNamesByIds(data: any): Observable<any>;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentService: PaymentServiceClient;
  private userService: UserServiceClient;

  constructor(
    @Inject('PAYMENT_PACKAGE') private paymentClient: ClientGrpc,
    @Inject('USER_PACKAGE') private userClient: ClientGrpc
  ) { }

  onModuleInit() {
    this.paymentService = this.paymentClient.getService<PaymentServiceClient>('PaymentService');
    this.userService = this.userClient.getService<UserServiceClient>('UserService');
  }

  // === Invoices ===
  getAllInvoices(data: any) {
    return lastValueFrom(this.paymentService.getAllInvoices(data));
  }

  async getInvoiceById(data: any) {
    const invoiceResponse = await lastValueFrom(this.paymentService.getInvoiceById(data));

    if (!invoiceResponse.ok) {
      return invoiceResponse;
    }

    const userResponse = await lastValueFrom(this.userService.getAllUserNamesByIds({
      ids: [invoiceResponse.data.patientId],
      correlationId: data.correlationId
    }));

    if (!userResponse.ok) {
      return userResponse;
    }

    invoiceResponse.data.patientName = userResponse.data[0].fullName;

    return invoiceResponse;
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
