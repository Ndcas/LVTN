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

    // === Booking ===
    getAllBookings(data: any): Observable<any>;
    getBookingById(data: any): Observable<any>;
    createBooking(data: any): Observable<any>;
    updateBookingStatus(data: any): Observable<any>;

    // === DoctorLeave ===
    getAllDoctorLeaves(data: any): Observable<any>;
    createDoctorLeave(data: any): Observable<any>;
    updateDoctorLeave(data: any): Observable<any>;

    // === ScheduleChangeRequest
    createScheduleChangeRequest(data: any): Observable<any>;
    updateScheduleChangeRequest(data: any): Observable<any>;
    getAllScheduleChangeRequests(data: any): Observable<any>;
    getScheduleChangeRequestById(data: any): Observable<any>;
}

interface UserServiceClient {
    getAllDoctorNamesBySpecialtyId(data: any): Observable<any>;
    getAllDoctorNamesByIds(data: any): Observable<any>;
    getDoctorById(data: any): Observable<any>;
    getUserById(data: any): Observable<any>;
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

        const doctorsNamesResponse = await lastValueFrom(this.userService.getAllDoctorNamesBySpecialtyId({
            id: specialtyId,
            correlationId
        }));

        if (!doctorsNamesResponse.ok) {
            return doctorsNamesResponse;
        }

        const doctorIds = doctorsNamesResponse.data.map(doctor => doctor.id);

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

        doctorsNamesResponse.data.forEach(doctor => {
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

    // === Booking ===
    getAllBookings(data: any) {
        return lastValueFrom(this.scheduleService.getAllBookings(data));
    }

    async getBookingById(data: any) {
        const bookingResult = await lastValueFrom(this.scheduleService.getBookingById(data));

        if (!bookingResult.ok) {
            return bookingResult;
        }

        const booking = bookingResult.data;

        if (data.userId != booking.patientId && data.userId != booking.doctorId) {
            return {
                ok: false,
                status: 403,
                error: 'Không có quyền xem thông tin khám bệnh này'
            };
        }

        const doctorResult = await lastValueFrom(this.userService.getDoctorById({
            id: booking.doctorId,
            correlationId: data.correlationId
        }));

        if (!doctorResult.ok) {
            return doctorResult;
        }

        const userResult = await lastValueFrom(this.userService.getUserById({
            id: booking.userId,
            correlationId: data.correlationId
        }));

        if (!userResult.ok) {
            return userResult;
        }

        return {
            ok: true,
            status: 200,
            data: {
                id: booking.id,
                status: booking.status,
                clinicDate: booking.clinicDate,
                clinicType: booking.clinicType,
                startTime: booking.startTime,
                endTime: booking.endTime,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
                doctor: {
                    fullName: doctorResult.data.fullName,
                    gender: doctorResult.data.gender,
                    dob: doctorResult.data.dob,
                    specialtyName: doctorResult.data.specialtyName,
                    degreeName: doctorResult.data.degreeName,
                    experienceYears: doctorResult.data.experienceYears,
                    biography: doctorResult.data.biography
                },
                patient: {
                    fullName: userResult.data.fullName,
                    gender: userResult.data.gender,
                    dob: userResult.data.dob
                }
            }
        };
    }

    createBooking(data: any) {
        return lastValueFrom(this.scheduleService.createBooking(data));
    }

    updateBookingStatus(data: any) {
        return lastValueFrom(this.scheduleService.updateBookingStatus(data));
    }

    // === DoctorLeave ===
    async getAllDoctorLeave(data: any) {
        const leavesResponse = await lastValueFrom(this.scheduleService.getAllDoctorLeaves(data));

        if (!leavesResponse.ok) {
            return leavesResponse;
        }

        if (leavesResponse.data.length == 0) {
            return {
                ok: true,
                status: 200,
                data: [],
                total: data.total,
                page: data.page,
                limit: data.limit
            };
        }

        const doctorIds = Array.from(new Set(leavesResponse.data.map(doctor => doctor.doctorId)));

        const doctorsResponse = await lastValueFrom(this.userService.getAllDoctorNamesByIds({
            ids: doctorIds,
            correlationId: data.correlationId
        }));

        if (!doctorsResponse.ok) {
            return doctorsResponse;
        }

        const doctorNameMap = new Map();

        doctorsResponse.data.forEach(doctor => {
            doctorNameMap.set(doctor.id, doctor.fullName);
        });

        return {
            ok: true,
            status: 200,
            data: leavesResponse.data.map(leave => ({
                ...leave,
                doctorName: doctorNameMap.get(leave.doctorId)
            })),
            total: leavesResponse.total,
            page: leavesResponse.page,
            limit: leavesResponse.limit
        };
    }

    createDoctorLeave(data: any) {
        return lastValueFrom(this.scheduleService.createDoctorLeave(data));
    }

    updateDoctorLeave(data: any) {
        return lastValueFrom(this.scheduleService.updateDoctorLeave(data));
    }

    // === ScheduleChangeRequest ===
    createScheduleChangeRequest(data: any) {
        return lastValueFrom(this.scheduleService.createScheduleChangeRequest(data));
    }

    updateScheduleChangeRequest(data: any) {
        return lastValueFrom(this.scheduleService.updateScheduleChangeRequest(data));
    }

    async getAllScheduleChangeRequests(data: any) {
        const requestsResponse = await lastValueFrom(this.scheduleService.getAllScheduleChangeRequests(data));

        if (!requestsResponse.ok || requestsResponse.data.length == 0) {
            return requestsResponse;
        }

        const doctorIds = Array.from(new Set(requestsResponse.data.map(request => request.doctorId)));

        const doctorsResponse = await lastValueFrom(this.userService.getAllDoctorNamesByIds({
            ids: doctorIds,
            correlationId: data.correlationId
        }));

        if (!doctorsResponse.ok) {
            return doctorsResponse;
        }

        const doctorNameMap = new Map();

        doctorsResponse.data.forEach(doctor => {
            doctorNameMap.set(doctor.id, doctor.fullName);
        });

        return {
            ok: true,
            status: 200,
            data: requestsResponse.data.map(request => ({
                ...request,
                doctorName: doctorNameMap.get(request.doctorId)
            })),
            total: requestsResponse.total,
            page: requestsResponse.page,
            limit: requestsResponse.limit
        };
    }

    async getScheduleChangeRequestById(data: any) {
        const requestResponse = await lastValueFrom(this.scheduleService.getScheduleChangeRequestById(data));

        if (!requestResponse.ok) {
            return requestResponse;
        }

        const doctorResponse = await lastValueFrom(this.userService.getDoctorById({
            id: requestResponse.data.doctorId,
            correlationId: data.correlationId
        }));

        if (!doctorResponse.ok) {
            return doctorResponse;
        }

        return {
            ok: true,
            status: 200,
            data: {
                ...requestResponse.data,
                doctorName: doctorResponse.data.fullName
            }
        };
    }
}