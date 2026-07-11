import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('global_holidays')
export class GlobalHoliday {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'date',
        name: 'holiday_date',
        unique: true
    })
    holidayDate: Date;

    @Column({
        type: 'varchar',
        length: 150
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createAt: Date;
}