import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_feedbacks')
export class UserFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
    type: 'int'
  })
  userId: number;

  @Column({
    type: 'varchar',
    length: 150
  })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    name: 'is_read',
    type: 'enum',
    enum: ['0', '1'],
    default: '0'
  })
  isRead: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
