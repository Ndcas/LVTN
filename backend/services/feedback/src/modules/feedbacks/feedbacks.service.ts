import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFeedback } from './entities/user-feedback.entity';

@Injectable()
export class FeedbacksService {
  constructor(@InjectRepository(UserFeedback) private feedbackRepository: Repository<UserFeedback>) { }

  async getAllFeedbacks(data: any) {
    const { page, limit, read } = data;
    const skip = (page - 1) * limit;
    const queryBuilder = this.feedbackRepository.createQueryBuilder('feedback');

    if (read == '0' || read == '1') {
      queryBuilder.andWhere('feedback.isRead = :read', { read });
    }

    queryBuilder.orderBy('feedback.createdAt', 'DESC');

    queryBuilder.skip(skip).take(limit);

    const [feedbacks, total] = await queryBuilder.getManyAndCount();
    const dataResponse = feedbacks.map(f => ({
      id: f.id,
      userId: f.userId,
      title: f.title,
      content: f.content,
      isRead: f.isRead,
      createdAt: f.createdAt.toISOString(),
    }));

    return {
      ok: true,
      status: 200,
      message: 'Lấy danh sách feedback thành công',
      data: dataResponse,
      total,
      page,
      limit
    };
  }

  async getFeedbackById(data: any) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: data.id }
    });

    if (!feedback) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy feedback'
      };
    }

    const item = {
      id: feedback.id,
      userId: feedback.userId,
      title: feedback.title,
      content: feedback.content,
      isRead: feedback.isRead,
      createdAt: feedback.createdAt.toISOString()
    };

    return {
      ok: true,
      status: 200,
      message: 'Thành công',
      data: item
    };
  }

  async createFeedback(data: any) {
    const feedback = this.feedbackRepository.create({
      userId: data.userId,
      title: data.title,
      content: data.content
    });

    await this.feedbackRepository.save(feedback);

    return {
      ok: true,
      status: 200,
      message: 'Góp ý đã được gửi thành công'
    };
  }

  async markAsRead(data: any) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: data.id }
    });

    if (!feedback) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy feedback'
      };
    }

    feedback.isRead = '1';

    await this.feedbackRepository.save(feedback);

    return {
      ok: true,
      status: 200,
      message: 'Đã đánh dấu là đã đọc'
    };
  }

  async getUnreadCount(data: any) {
    const count = await this.feedbackRepository.count({
      where: { isRead: '0' }
    });

    return {
      ok: true,
      status: 200,
      message: 'Thành công',
      count
    }
  }
}
