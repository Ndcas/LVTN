import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ScheduleChangeRequest } from "./schedule-change-request-detail.entity";

export enum ClinicType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINe'
}

@Entity('schedule_change_request_details')
export class ScheduleChangeRequestDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'request_id',
        type: 'int'
    })
    requestId: number;

    @ManyToOne(() => ScheduleChangeRequest, (scheduleChangeRequest) => scheduleChangeRequest.scheduleChangeRequestDetails)
    @JoinColumn({ name: 'request_id' })
    scheduleChangeRequest: ScheduleChangeRequest;

    @Column({
        name: 'day_of_week',
        type: 'tinyint'
    })
    dayOfWeek: number;

    @Column({
        name: 'start_time',
        type: 'time'
    })
    startTime: string;

    @Column({
        name: 'end_time',
        type: 'time'
    })
    endTime: string;

    @Column({
        name: 'clinic_type',
        type: 'enum',
        enum: ClinicType
    })
    clinicType: ClinicType;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}