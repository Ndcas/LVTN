import { DoctorMetadata } from 'src/modules/doctors/entities/doctor-metadata.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('degrees')
export class Degree {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => DoctorMetadata, (doctorMetadata) => doctorMetadata.degree)
  doctorMetadatas: DoctorMetadata[];
}
