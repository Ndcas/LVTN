import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ScheduleChangeRequest } from './entities/schedule-change-request.entity';
import { ClinicType, ScheduleChangeRequestDetail } from './entities/schedule-change-request-detail.entity';
import { OpeningTime } from '../openingtime/entities/opening-time.entity';

@Injectable()
export class ChangeRequestsService {
    constructor(
        @InjectRepository(ScheduleChangeRequest) private scheduleChangeRequestRepository: Repository<ScheduleChangeRequest>,
        @InjectRepository(ScheduleChangeRequestDetail) private scheduleChangeRequestDetailRepository: Repository<ScheduleChangeRequestDetail>,
        private dataSource: DataSource
    ) { }

    async getAll(data: any) {
        const { page = 1, limit = 10, doctorId, status } = data;
        const skip = (page - 1) * limit;
        const queryBuilder = this.scheduleChangeRequestRepository.createQueryBuilder('request');

        if (status) {
            queryBuilder.andWhere('request.status = :status', { status });
        }

        if (doctorId) {
            queryBuilder.andWhere('request.doctorId = :doctorId', { doctorId });
        }

        queryBuilder.orderBy('request.createdAt', 'DESC');

        const [requests, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

        return {
            ok: true,
            status: 200,
            data: requests.map(request => {
                return {
                    ...request,
                    createdAt: request.createdAt.toISOString(),
                    updatedAt: request.updatedAt.toISOString()
                };
            }),
            total,
            page,
            limit
        };
    }

    async getById(data: any) {
        const { id, doctorId } = data;
        const request = await this.scheduleChangeRequestRepository.findOne({
            where: { id, doctorId },
            relations: { scheduleChangeRequestDetails: true }
        });

        if (!request) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy yêu cầu'
            };
        }

        return {
            ok: true,
            status: 200,
            data: {
                ...request,
                createdAt: request.createdAt.toISOString(),
                updatedAt: request.updatedAt.toISOString(),
                scheduleChangeRequestDetails: request.scheduleChangeRequestDetails.map(detail => ({
                    ...detail,
                    createdAt: detail.createdAt.toISOString()
                }))
            }
        };
    }

    async create(data: any) {
        const { doctorId, details } = data;
        const detailMap = new Map();

        for (const detail of details) {
            detail.startTimeSeconds = this.timeToSeconds(detail.startTime);
            detail.endTimeSeconds = this.timeToSeconds(detail.endTime);

            if (detail.startTimeSeconds >= detail.endTimeSeconds) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'
                };
            }

            if (!detailMap.has(detail.dayOfWeek)) {
                detailMap.set(detail.dayOfWeek, []);
            }

            if (detailMap
                .get(detail.dayOfWeek)
                .some(d => detail.startTimeSeconds < d.endTimeSeconds && detail.endTimeSeconds > d.startTimeSeconds)) {
                return {
                    ok: false,
                    status: 400,
                    error: 'Thời gian làm việc không được trùng lặp nhau trong cùng một ngày'
                };
            }

            detailMap.get(detail.dayOfWeek).push({
                startTime: detail.startTimeSeconds,
                endTime: detail.endTimeSeconds
            });
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const openingTimes = await queryRunner.manager.getRepository(OpeningTime).find({
                lock: { mode: 'pessimistic_read' }
            });
            const openingTimeMap = new Map();

            for (const openingTime of openingTimes) {
                if (!openingTimeMap.has(openingTime.dayOfWeek)) {
                    openingTimeMap.set(openingTime.dayOfWeek, []);
                }

                openingTimeMap.get(openingTime.dayOfWeek).push({
                    startTime: this.timeToSeconds(openingTime.startTime),
                    endTime: this.timeToSeconds(openingTime.endTime)
                });
            }

            for (const detail of details) {
                if (detail.clinicType == ClinicType.ONLINE) {
                    continue;
                }

                if (!openingTimeMap.has(detail.dayOfWeek)) {
                    await queryRunner.rollbackTransaction();

                    return {
                        ok: false,
                        status: 400,
                        error: 'Ngày trong tuần không hợp lệ với lịch hoạt động của phòng khám'
                    };
                }

                if (!openingTimeMap
                    .get(detail.dayOfWeek)
                    .some(ot => detail.startTimeSeconds >= ot.startTime && detail.endTimeSeconds <= ot.endTime)) {
                    await queryRunner.rollbackTransaction();

                    return {
                        ok: false,
                        status: 400,
                        error: 'Thời gian không hợp lệ với lịch hoạt động của phòng khám'
                    };
                }
            }

            let request = this.scheduleChangeRequestRepository.create({ doctorId });
            request = await queryRunner.manager.save(ScheduleChangeRequest, request);

            const detailsToBeSaved = this.scheduleChangeRequestDetailRepository.create(details.map(d => ({
                ...d,
                requestId: request.id
            })));

            await queryRunner.manager.save(ScheduleChangeRequestDetail, detailsToBeSaved);

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                message: 'Tạo yêu cầu thay đổi lịch làm việc thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async update(data: any) { }

    private timeToSeconds(time: string) {
        const [hours, minutes, seconds] = time.split(':').map(Number);

        return hours * 3600 + minutes * 60 + seconds;
    }
}
