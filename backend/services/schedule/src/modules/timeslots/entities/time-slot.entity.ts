import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum ClinicType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

export enum Status {
    AVAILABLE = 'AVAILABLE',
    BOOKED = 'BOOKED'
}

@Entity('time_slots')
export class TimeSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
        name: 'doctor_id'
    })
    doctorId: number;

    @Column({
        type: 'date',
        name: 'clinic_date'
    })
    clinicDate: Date;

    @Column({
        type: 'time',
        name: 'start_time'
    })
    startTime: string;

    @Column({
        type: 'time',
        name: 'end_time'
    })
    endTime: string;

    @Column({
        type: 'enum',
        name: 'clinic_type',
        enum: ClinicType
    })
    clinicType: ClinicType;

    @Column({
        type: 'enum',
        name: 'status',
        enum: Status,
        default: Status.AVAILABLE
    })
    status: Status;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}