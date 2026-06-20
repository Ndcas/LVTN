import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_fcm_tokens')
export class UserFcmToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, user => user.fcmTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'device_id', type: 'varchar', length: 100, unique: true })
  deviceId: string;

  @Column({ name: 'fcm_token', type: 'text' })
  fcmToken: string;

  @Column({ name: 'device_name', type: 'varchar', length: 100, nullable: true })
  deviceName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
