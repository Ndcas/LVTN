import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface FeedbackServiceClient {
  getAllFeedbacks(data: any): Observable<any>;
  getFeedbackById(data: any): Observable<any>;
  createFeedback(data: any): Observable<any>;
  markAsRead(data: any): Observable<any>;
  getUnreadCount(data: any): Observable<any>;
}

@Injectable()
export class FeedbackService implements OnModuleInit {
  private feedbackService: FeedbackServiceClient;

  constructor(@Inject('FEEDBACK_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.feedbackService = this.client.getService<FeedbackServiceClient>('FeedbackService');
  }

  async getAllFeedbacks(data: any) {
    return await firstValueFrom(this.feedbackService.getAllFeedbacks(data));
  }

  async getFeedbackById(data: any) {
    return await firstValueFrom(this.feedbackService.getFeedbackById(data));
  }

  async createFeedback(data: any) {
    return await firstValueFrom(this.feedbackService.createFeedback(data));
  }

  async markAsRead(data: any) {
    return await firstValueFrom(this.feedbackService.markAsRead(data));
  }

  async getUnreadCount(data: any) {
    return await firstValueFrom(this.feedbackService.getUnreadCount(data));
  }
}
