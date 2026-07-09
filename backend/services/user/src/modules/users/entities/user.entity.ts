import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Role } from '../../catalogs/entities/role.entity';
import { DoctorMetadata } from '../../doctors/entities/doctor-metadata.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role_id',
    type: 'int'
  })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({
    type: 'varchar',
    length: 15,
    unique: true
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true
  })
  email: string;

  @Column({
    name: 'is_active',
    type: 'enum',
    enum: ['0', '1'],
    default: '1'
  })
  isActive: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100
  })
  fullName: string;

  @Column({
    type: 'enum',
    enum: ['MALE', 'FEMALE', 'OTHER']
  })
  gender: string;

  @Column({
    type: 'date',
    nullable: true
  })
  dob: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  address: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => DoctorMetadata, (metadata) => metadata.user)
  doctorMetadata: DoctorMetadata;

  @Column({
    name: 'device_id',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  deviceId: string | null;

  @Column({
    name: 'fcm_token',
    type: 'text',
    nullable: true
  })
  fcmToken: string | null;

  @Column({
    name: 'device_name',
    type: 'varchar',
    length: 100,
    nullable: true
  })
  deviceName: string | null;
}
