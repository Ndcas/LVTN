import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ScheduleChangeRequestDetail } from "./schedule-change-request-detail.entity";

export enum Status {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('schedule_change_requests')
export class ScheduleChangeRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'doctor_id',
        type: 'int'
    })
    doctorId: number;

    @Column({
        name: 'status',
        type: 'enum',
        enum: Status,
        default: Status.PENDING
    })
    status: Status;

    @Column({
        name: 'rejected_reason',
        type: 'varchar',
        length: 255,
        nullable: true
    })
    rejectedReason: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => ScheduleChangeRequestDetail, (scheduleChangeRequestDetail) => scheduleChangeRequestDetail.scheduleChangeRequest)
    scheduleChangeRequestDetails: ScheduleChangeRequestDetail[];
}