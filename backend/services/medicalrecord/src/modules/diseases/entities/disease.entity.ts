import { MedicalRecord } from 'src/modules/records/entities/medical-record.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('diseases')
export class Disease {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'disease_code',
    type: 'varchar',
    length: 20,
    unique: true
  })
  diseaseCode: string;

  @Column({
    type: 'varchar',
    length: 255
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true
  })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => MedicalRecord, (medicalRecord) => medicalRecord.disease)
  medicalRecords: MedicalRecord[];
}
