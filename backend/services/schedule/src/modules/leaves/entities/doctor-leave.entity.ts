import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Status {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('doctor_leaves')
export class DoctorLeave {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'doctor_id',
        type: 'int'
    })
    doctorId: number;

    @Column({
        name: 'leave_date',
        type: 'date'
    })
    leaveDate: string;

    @Column({
        type: 'varchar',
        length: 255
    })
    reason: string;

    @Column({
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
}