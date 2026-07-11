import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OpeningTime } from './entities/opening-time';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OpeningTimeService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(OpeningTime) private readonly openingTimeRepository: Repository<OpeningTime>
    ) { }

    async getAll(data: any) {
        const openingTimes = await this.openingTimeRepository.find();

        return {
            ok: true,
            status: 200,
            message: 'Lấy danh sách thời gian mở cửa thành công',
            data: openingTimes.map(ot => ({
                dayOfWeek: ot.dayOfWeek,
                startTime: ot.startTime,
                endTime: ot.endTime
            }))
        };
    }

    async updateBulk(data: any) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.deleteAll(OpeningTime);

            const openingTimes = this.openingTimeRepository.create(data.openingTimes.map(ot => ({
                dayOfWeek: ot.dayOfWeek,
                startTime: ot.startTime,
                endTime: ot.endTime
            })));

            await queryRunner.manager.save(OpeningTime, openingTimes);

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                message: 'Cập nhật thời gian mở cửa thành công'
            };
        } catch (e) {
            await queryRunner.rollbackTransaction();

            throw e;
        } finally {
            await queryRunner.release();
        }
    }
}
