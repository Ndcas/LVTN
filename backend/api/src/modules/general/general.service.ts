import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientProxy, type ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom, Observable } from "rxjs";

interface UserServiceClient {
    getTotalPatientsCount(data: any): Observable<any>;
}

interface ScheduleServiceClient {
    getTodayAppointmentsCount(data: any): Observable<any>;
}

interface PaymentServiceClient {
    getUnpaidInvoicesCount(data: any): Observable<any>;
}

interface FeedbackServiceClient {
    getUnreadCount(data: any): Observable<any>;
}

interface LogServiceClient {
    getLogs(data: any): Observable<any>;
}

@Injectable()
export class GeneralService implements OnModuleInit {
    private userService: UserServiceClient;
    private scheduleService: ScheduleServiceClient;
    private paymentService: PaymentServiceClient;
    private feedbackService: FeedbackServiceClient;
    private logService: LogServiceClient;

    constructor(
        @Inject('USER_PACKAGE') private userServiceClient: ClientGrpc,
        @Inject('SCHEDULE_PACKAGE') private scheduleServiceClient: ClientGrpc,
        @Inject('PAYMENT_PACKAGE') private paymentServiceClient: ClientGrpc,
        @Inject('FEEDBACK_PACKAGE') private feedbackServiceClient: ClientGrpc,
        @Inject('LOG_PACKAGE') private logServiceClient: ClientGrpc,
        @Inject('LOG_SERVICE') private logClient: ClientProxy,
        @Inject(CACHE_MANAGER) private cache: Cache
    ) { }

    private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
        this.logClient.emit('system_log', {
            level: level,
            message: `${action} ${info}`,
            service: 'api_gateway',
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        });
    }

    onModuleInit() {
        this.userService = this.userServiceClient.getService<UserServiceClient>('UserService');
        this.scheduleService = this.scheduleServiceClient.getService<ScheduleServiceClient>('ScheduleService');
        this.paymentService = this.paymentServiceClient.getService<PaymentServiceClient>('PaymentService');
        this.feedbackService = this.feedbackServiceClient.getService<FeedbackServiceClient>('FeedbackService');
        this.logService = this.logServiceClient.getService<LogServiceClient>('LogService');
    }

    async getAdminDashboardData(data: any) {
        if (!data.forceRefresh) {
            try {
                const cachedData = await this.cache.get('admin_dashboard');

                if (cachedData) {
                    return {
                        ok: true,
                        status: 200,
                        data: cachedData
                    };
                }
            } catch (error) {
                this.processLog('GetAdminDashboardData', data.correlationId, `Lỗi khi lấy dữ liệu dashboard từ cache: ${error}`, 'warn');
            }
        }

        const responses = await Promise.all([
            lastValueFrom(this.userService.getTotalPatientsCount({ correlationId: data.correlationId })),
            lastValueFrom(this.scheduleService.getTodayAppointmentsCount({ correlationId: data.correlationId })),
            lastValueFrom(this.paymentService.getUnpaidInvoicesCount({ correlationId: data.correlationId })),
            lastValueFrom(this.feedbackService.getUnreadCount({ correlationId: data.correlationId })),
            lastValueFrom(this.logService.getLogs({
                correlationId: data.correlationId,
                minLevel: 'warn',
                date: this.getYYYMMDD()
            }))
        ]);

        const error = responses.find(r => !r.ok);

        if (error) {
            return {
                ok: false,
                status: error.status,
                error: error.error
            };
        }

        const dashboardData = {
            patientsCount: responses[0].count,
            todayAppointmentsCount: responses[1].count,
            unpaidInvoicesCount: responses[2].count,
            unreadFeedbackCount: responses[3].count,
            logs: responses[4].data
        };

        this.cache.set('admin_dashboard', dashboardData, 1800000).catch(e => {
            this.processLog('GetAdminDashboardData', data.correlationId, `Lỗi khi lưu dữ liệu dashboard vào cache: ${e}`, 'warn');
        });

        return {
            ok: true,
            status: 200,
            data: dashboardData
        };
    }

    private getYYYMMDD() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}