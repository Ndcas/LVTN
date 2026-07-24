import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IsRead {
  NO = '0',
  YES = '1'
}

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
    enum: IsRead,
    default: IsRead.NO
  })
  isRead: IsRead;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
