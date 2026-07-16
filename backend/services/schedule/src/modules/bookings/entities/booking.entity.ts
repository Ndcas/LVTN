import { TimeSlot } from "src/modules/timeslots/entities/time-slot.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Status {
    CONFIRMED = 'CONFIRMED',
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED',
    NO_SHOW = 'NO_SHOW'
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'patient_id',
        type: 'int'
    })
    patientId: number;

    @Column({
        name: 'time_slot_id',
        type: 'int'
    })
    timeSlotId: number;

    @ManyToOne(() => TimeSlot, (timeSlot) => timeSlot.bookings)
    @JoinColumn({ name: 'time_slot_id' })
    timeSlot: TimeSlot;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.CONFIRMED,
        nullable: true
    })
    status: Status;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}