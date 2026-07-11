import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class OpeningTime {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}