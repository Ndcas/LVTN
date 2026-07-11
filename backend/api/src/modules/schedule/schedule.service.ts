import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom, Observable } from "rxjs";

interface ScheduleServiceClient {

    // === OpeningTime ===
    getAll(data: any): Observable<any>;
    updateBulk(data: any): Observable<any>;
}

@Injectable()
export class ScheduleService implements OnModuleInit {
    private scheduleService: ScheduleServiceClient

    constructor(@Inject('SCHEDULE_PACKAGE') private client: ClientGrpc) { }

    onModuleInit() {
        this.scheduleService = this.client.getService<ScheduleServiceClient>('ScheduleService');
    }

    // === OpeningTime ===
    getAll(data: any) {
        return lastValueFrom(this.scheduleService.getAll(data));
    }

    updateBulk(data: any) {
        return lastValueFrom(this.scheduleService.updateBulk(data));
    }
}