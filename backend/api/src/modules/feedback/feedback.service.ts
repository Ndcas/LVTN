import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface FeedbackServiceClient {
    getAllFeedbacks(data: any): Observable<any>;
    getFeedbackById(data: any): Observable<any>;
    createFeedback(data: any): Observable<any>;
    markAsRead(data: any): Observable<any>;
    getUnreadCount(data: any): Observable<any>;
}

interface UserServiceClient {
    getAllUserNamesByIds(data: any): Observable<any>;
}

@Injectable()
export class FeedbackService implements OnModuleInit {
    private feedbackService: FeedbackServiceClient;
    private userService: UserServiceClient;

    constructor(
        @Inject('FEEDBACK_PACKAGE') private feedbackServiceClient: ClientGrpc,
        @Inject('USER_PACKAGE') private userServiceClient: ClientGrpc
    ) { }

    onModuleInit() {
        this.feedbackService = this.feedbackServiceClient.getService<FeedbackServiceClient>('FeedbackService');
        this.userService = this.userServiceClient.getService<UserServiceClient>('UserService');
    }

    getAllFeedbacks(data: any) {
        return lastValueFrom(this.feedbackService.getAllFeedbacks(data));
    }

    async getFeedbackById(data: any) {
        const feedbackResponse = await lastValueFrom(this.feedbackService.getFeedbackById(data));
        if (!feedbackResponse.ok) {
            return feedbackResponse;
        }

        const userResponse = await lastValueFrom(this.userService.getAllUserNamesByIds({
            ids: [feedbackResponse.data.userId],
            correlationId: data.correlationId
        }));

        if (!userResponse.ok) {
            return userResponse;
        }

        feedbackResponse.data.userName = userResponse.data[0].fullName;

        return feedbackResponse;
    }

    createFeedback(data: any) {
        return lastValueFrom(this.feedbackService.createFeedback(data));
    }

    markAsRead(data: any) {
        return lastValueFrom(this.feedbackService.markAsRead(data));
    }

    getUnreadCount(data: any) {
        return lastValueFrom(this.feedbackService.getUnreadCount(data));
    }
}