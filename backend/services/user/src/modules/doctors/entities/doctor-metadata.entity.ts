import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Specialty } from '../../catalogs/entities/specialty.entity';
import { Degree } from '../../catalogs/entities/degree.entity';

@Entity('doctor_metadata')
export class DoctorMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
    unique: true
  })
  userId: number;

  @OneToOne(() => User, (user) => user.doctorMetadata)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'specialty_id',
    type: 'int'
  })
  specialtyId: number;

  @ManyToOne(() => Specialty, (specialty) => specialty.doctorMetadatas)
  @JoinColumn({ name: 'specialty_id' })
  specialty: Specialty;

  @Column({
    name: 'degree_id',
    type: 'int'
  })
  degreeId: number;

  @ManyToOne(() => Degree, (degree) => degree.doctorMetadatas)
  @JoinColumn({ name: 'degree_id' })
  degree: Degree;

  @Column({
    type: 'text',
    nullable: true
  })
  biography: string | null;

  @Column({
    name: 'experience_years',
    type: 'int',
    default: 0
  })
  experienceYears: number;

  @Column({
    name: 'work_type',
    type: 'enum',
    enum: ['ONLINE', 'OFFLINE', 'BOTH'],
    default: 'BOTH'
  })
  workType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
