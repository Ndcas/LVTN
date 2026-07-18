import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DoctorLeave, Status } from './entities/doctor-leave.entity';

@Injectable()
export class LeavesService {
    constructor(
        @InjectRepository(DoctorLeave) private doctorLeaveRepository: Repository<DoctorLeave>,
        private dataSource: DataSource
    ) { }

    async getAll(data: any) {
        const { page = 1, limit = 10, doctorId, status } = data;
        const skip = (page - 1) * limit;
        const queryBuilder = this.doctorLeaveRepository.createQueryBuilder('leave');

        if (status) {
            queryBuilder.andWhere('leave.status = :status', { status });
        }

        if (doctorId) {
            queryBuilder.andWhere('leave.doctorId = :doctorId', { doctorId });
        }

        queryBuilder.orderBy('leave.createdAt', 'DESC');

        const [leaves, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

        return {
            ok: true,
            status: 200,
            data: leaves.map(leave => {
                return {
                    ...leave,
                    createdAt: leave.createdAt.toISOString(),
                    updatedAt: leave.updatedAt.toISOString()
                };
            }),
            total,
            page,
            limit
        };
    }

    async create(data: any) {
        const { doctorId, leaveDate, reason } = data;
        const leave = this.doctorLeaveRepository.create({ doctorId, leaveDate, reason });

        await this.doctorLeaveRepository.save(leave);

        return {
            ok: true,
            status: 200,
            data: leave
        };
    }

    async update(data: any) {
        const { id, status, rejectedReason } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const leave = await queryRunner.manager.getRepository(DoctorLeave).findOne({
                where: {
                    id,
                    status: Status.PENDING
                },
                lock: { mode: 'pessimistic_write' }
            });

            if (!leave) {
                return {
                    ok: false,
                    status: 404,
                    error: 'Không tìm thấy đơn xin nghỉ'
                };
            }

            leave.status = status;
            leave.rejectedReason = rejectedReason || null;

            await queryRunner.manager.save(DoctorLeave, leave);

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                message: 'Cập nhật đơn xin nghỉ thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
