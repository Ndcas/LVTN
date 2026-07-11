import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ClinicType {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE'
}

@Entity('doctor_weekly_templates')
export class DoctorWeeklyTemplate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
        name: 'doctor_id'
    })
    doctorId: number;

    @Column({
        type: 'tinyint',
        name: 'day_of_week'
    })
    dayOfWeek: number;

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
