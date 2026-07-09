import { DoctorMetadata } from 'src/modules/doctors/entities/doctor-metadata.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true
  })
  code: string;

  @Column({
    type: 'text',
    nullable: true
  })
  description: string | null;

  @Column({
    name: 'default_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 100000.00
  })
  defaultFee: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => DoctorMetadata, (doctorMetadata) => doctorMetadata.specialty)
  doctorMetadatas: DoctorMetadata[]
}
