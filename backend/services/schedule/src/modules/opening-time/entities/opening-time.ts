import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class OpeningTime {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    day_of_week: number;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}