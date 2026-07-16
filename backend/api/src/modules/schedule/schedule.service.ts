import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { type ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom, Observable } from "rxjs";

interface ScheduleServiceClient {

    // === OpeningTime ===
    getOpeningTime(data: any): Observable<any>;

    // === GlobalHoliday
    getAllHolidays(data: any): Observable<any>;
    createHoliday(data: any): Observable<any>;
    updateHoliday(data: any): Observable<any>;
    deleteHoliday(data: any): Observable<any>;

    // === DoctorWeeklyTemplate
    getWeeklyTemplateByDoctor(data: any): Observable<any>;

    // === TimeSlot ===
    getAvailableTimeSlots(data: any): Observable<any>;
    scheduleTimeSlots(data: any): Observable<any>;
    deleteOldTimeSlots(data: any): Observable<any>;
}

interface UserServiceClient {
    getAllDoctorsBySpecialtyId(data: any): Observable<any>;
}

@Injectable()
export class ScheduleService implements OnModuleInit {
    private scheduleService: ScheduleServiceClient
    private userService: UserServiceClient

    constructor(
        @Inject('SCHEDULE_PACKAGE') private scheduleClient: ClientGrpc,
        @Inject('USER_PACKAGE') private userClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.scheduleService = this.scheduleClient.getService<ScheduleServiceClient>('ScheduleService');
        this.userService = this.userClient.getService<UserServiceClient>('UserService');
    }

    // === OpeningTime ===
    getOpeningTime(data: any) {
        return lastValueFrom(this.scheduleService.getOpeningTime(data));
    }

    // === GlobalHoliday ===
    getAllHolidays(data: any) {
        return lastValueFrom(this.scheduleService.getAllHolidays(data));
    }

    createHoliday(data: any) {
        return lastValueFrom(this.scheduleService.createHoliday(data));
    }

    updateHoliday(data: any) {
        return lastValueFrom(this.scheduleService.updateHoliday(data));
    }

    deleteHoliday(data: any) {
        return lastValueFrom(this.scheduleService.deleteHoliday(data));
    }

    // === DoctorWeeklyTemplate ===
    getWeeklyTemplateByDoctor(data: any) {
        return lastValueFrom(this.scheduleService.getWeeklyTemplateByDoctor(data));
    }

    // === TimeSlot ===
    async getAvailableTimeSlots(data: any) {
        const { specialtyId, date, startTime, endTime, clinicType, correlationId } = data;

        const doctorsIdsResponse = await lastValueFrom(this.userService.getAllDoctorsBySpecialtyId({
            id: specialtyId,
            correlationId
        }));

        if (!doctorsIdsResponse.ok) {
            return doctorsIdsResponse;
        }

        const doctorIds = doctorsIdsResponse.data.map(doctor => doctor.id);

        const availableTimeSlotsResponse = await lastValueFrom(this.scheduleService.getAvailableTimeSlots({
            date,
            startTime,
            endTime,
            doctorIds,
            clinicType,
            correlationId
        }));

        if (!availableTimeSlotsResponse.ok) {
            return availableTimeSlotsResponse;
        }

        const doctorNameMap = new Map();

        doctorsIdsResponse.data.forEach(doctor => {
            doctorNameMap.set(doctor.id, doctor.fullName);
        });

        const availableTimeSlots = availableTimeSlotsResponse.data.map(timeSlot => ({
            ...timeSlot,
            doctorName: doctorNameMap.get(timeSlot.doctorId)
        }));

        return {
            ok: true,
            status: 200,
            data: availableTimeSlots
        };
    }

    scheduleTimeSlots(data: any) {
        return lastValueFrom(this.scheduleService.scheduleTimeSlots(data));
    }

    deleteOldTimeSlots(data: any) {
        return lastValueFrom(this.scheduleService.deleteOldTimeSlots(data))
    }
}