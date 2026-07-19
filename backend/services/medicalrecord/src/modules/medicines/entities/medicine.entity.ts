import { PrescriptionDetail } from 'src/modules/records/entities/prescription-detail.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum IsActive {
  ACTIVE = '1',
  INACTIVE = '0',
}

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 30
  })
  unit: string;

  @Column({
    name: 'price_per_unit',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  pricePerUnit: number;

  @Column({
    name: 'is_active',
    type: 'enum',
    enum: IsActive,
    default: IsActive.ACTIVE
  })
  isActive: IsActive;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PrescriptionDetail, (detail) => detail.medicine)
  prescriptionDetails: PrescriptionDetail[];
}
