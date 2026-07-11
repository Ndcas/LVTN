import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OpeningTime } from './entities/opening-time.entity';
import { DataSource, Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { TimeSlot } from '../timeslots/entities/time-slot.entity';
import { DoctorWeeklyTemplate } from '../templates/entities/doctor-weekly-template.entity';
import * as crypto from 'crypto';

@Injectable()
export class OpeningTimeService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(OpeningTime) private readonly openingTimeRepository: Repository<OpeningTime>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    async getAll(data: any) {
        const cacheData = await this.cacheManager.get('openingTime');

        if (cacheData) {
            return {
                ok: true,
                status: 200,
                message: 'Lấy danh sách thời gian mở cửa thành công',
                data: cacheData
            };
        }

        const openingTimes = await this.openingTimeRepository.find();

        const responseData = openingTimes.map(ot => ({
            dayOfWeek: ot.dayOfWeek,
            startTime: ot.startTime,
            endTime: ot.endTime,
            createdAt: ot.createdAt.toISOString(),
            updatedAt: ot.updatedAt.toISOString()
        }));

        await this.cacheManager.set('openingTime', responseData, 1800000);

        return {
            ok: true,
            status: 200,
            message: 'Lấy danh sách thời gian mở cửa thành công',
            data: responseData
        };
    }

    private parseTimeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private formatMinutesToTime(minutes: number): string {
        const h = Math.floor(minutes / 60).toString().padStart(2, '0');
        const m = (minutes % 60).toString().padStart(2, '0');
        return `${h}:${m}:00`;
    }

    // Helper: Tính A \ B (những khoảng thời gian có trong A nhưng không có trong B)
    // Tách riêng ra hàm helper để logic tính overlap chặt chẽ, không bị lỗi khi loop
    private subtractIntervals(intervalsA: { start: number, end: number }[], intervalsB: { start: number, end: number }[]) {
        const result = [...intervalsA];

        for (const intervalA of intervalsA) {
            for (const intervalB of intervalsB) {
                if (intervalA.start >= intervalB.end || intervalA.end <= intervalB.start) {
                    continue;
                }

                if (intervalA.start < intervalB.start) {

                }
            }
        }
        return result;
    }

    private calculateDiffIntervals(oldTimes: OpeningTime[], newTimes: any[]) {
        const removedIntervals: { dayOfWeek: number, startTime: string, endTime: string }[] = [];
        const addedIntervals: { dayOfWeek: number, startTime: string, endTime: string }[] = [];

        // Duyệt từ 0 đến 7 để bao quát toàn bộ trường hợp dayOfWeek (0=Sun, 1=Mon hoặc 7=Sun)
        for (let day = 0; day <= 6; day++) {
            const oldDayTimes = oldTimes.filter(ot => ot.dayOfWeek == day);
            const newDayTimes = newTimes.filter(nt => nt.dayOfWeek == day);

            if (oldDayTimes.length === 0 && newDayTimes.length === 0) continue;

            const oldIntervals = oldDayTimes.map(ot => ({
                start: this.parseTimeToMinutes(ot.startTime),
                end: this.parseTimeToMinutes(ot.endTime)
            }));

            const newIntervals = newDayTimes.map(nt => ({
                start: this.parseTimeToMinutes(nt.startTime),
                end: this.parseTimeToMinutes(nt.endTime)
            }));

            // Bị xóa = Cũ \ Mới
            const removed = this.subtractIntervals(oldIntervals, newIntervals);
            removed.forEach(interval => {
                removedIntervals.push({
                    dayOfWeek: day,
                    startTime: this.formatMinutesToTime(interval.start),
                    endTime: this.formatMinutesToTime(interval.end)
                });
            });

            // Được thêm mới (dôi ra) = Mới \ Cũ
            const added = this.subtractIntervals(newIntervals, oldIntervals);
            added.forEach(interval => {
                addedIntervals.push({
                    dayOfWeek: day,
                    startTime: this.formatMinutesToTime(interval.start),
                    endTime: this.formatMinutesToTime(interval.end)
                });
            });
        }

        return { removedIntervals, addedIntervals };
    }

    async updateBulk(data: any) {
        const lockId = crypto.randomUUID();

        try {
            const currentLock = await this.cacheManager.get('Lock:UpdateSchedule');

            if (currentLock) {
                return {
                    ok: false,
                    status: 409,
                    error: 'Hệ thống đang cập nhật lịch hoạt động, vui lòng thử lại sau ít phút.'
                };
            }

            await this.cacheManager.set('Lock:UpdateSchedule', lockId, 600000);

            const queryRunner = this.dataSource.createQueryRunner();

            await queryRunner.connect();

            await queryRunner.startTransaction();

            try {
                const oldOpeningTimes = await queryRunner.manager.find(OpeningTime);

                const { removedIntervals, addedIntervals } = this.calculateDiffIntervals(oldOpeningTimes, data.openingTimes);

                if (removedIntervals.length > 0) {
                    const qb = queryRunner.manager.createQueryBuilder(TimeSlot, 'ts')
                        .where('ts.clinicDate >= CURDATE()')
                        .andWhere('ts.status = :status', { status: 'BOOKED' });

                    let conditionStr = '';
                    const conditionParams: any = {};

                    removedIntervals.forEach((interval, index) => {
                        // Áp dụng công thức (day % 7) + 1 giúp cover cả 2 trường hợp:
                        // 0=Sun -> 1(Sun MySQL), 1=Mon -> 2(Mon MySQL), 7=Sun -> 1(Sun MySQL)
                        const mysqlDow = (interval.dayOfWeek % 7) + 1;
                        const orCond = `(DAYOFWEEK(ts.clinic_date) = :dow${index} AND ts.start_time < :end${index} AND ts.end_time > :start${index})`;

                        conditionStr += (index === 0) ? orCond : ` OR ${orCond}`;
                        conditionParams[`dow${index}`] = mysqlDow;
                        conditionParams[`start${index}`] = interval.startTime;
                        conditionParams[`end${index}`] = interval.endTime;
                    });

                    qb.andWhere(`(${conditionStr})`, conditionParams);
                    const affectedBookings = await qb.getCount();

                    if (affectedBookings > 0) {
                        return {
                            ok: false,
                            status: 400,
                            error: `Không thể cập nhật! Có ${affectedBookings} ca khám đã được đặt bởi bệnh nhân nằm ngoài khung giờ mới. Vui lòng xử lý thủ công các ca này trước.`
                        };
                    }
                }

                // 4. Update OpeningTime
                await queryRunner.manager.delete(OpeningTime, {});

                const newOpeningTimes = this.openingTimeRepository.create(data.openingTimes.map((ot: any) => ({
                    dayOfWeek: ot.dayOfWeek,
                    startTime: ot.startTime,
                    endTime: ot.endTime
                })));

                await queryRunner.manager.save(OpeningTime, newOpeningTimes);

                // 5. Xóa các TimeSlots (AVAILABLE) và Templates lọt vào khoảng cắt
                if (removedIntervals.length > 0) {
                    // Xóa TimeSlots
                    const deleteTsQb = queryRunner.manager.createQueryBuilder()
                        .delete()
                        .from(TimeSlot, 'ts')
                        .where('clinic_date >= CURDATE()')
                        .andWhere('status = :status', { status: 'AVAILABLE' });

                    let tsCondStr = '';
                    const tsParams: any = {};
                    removedIntervals.forEach((interval, index) => {
                        const mysqlDow = (interval.dayOfWeek % 7) + 1;
                        const orCond = `(DAYOFWEEK(clinic_date) = :dow${index} AND start_time < :end${index} AND end_time > :start${index})`;
                        tsCondStr += (index === 0) ? orCond : ` OR ${orCond}`;
                        tsParams[`dow${index}`] = mysqlDow;
                        tsParams[`start${index}`] = interval.startTime;
                        tsParams[`end${index}`] = interval.endTime;
                    });
                    deleteTsQb.andWhere(`(${tsCondStr})`, tsParams);
                    await deleteTsQb.execute();

                    // Xóa Doctor Templates lọt vào vùng cắt
                    const deleteTplQb = queryRunner.manager.createQueryBuilder()
                        .delete()
                        .from(DoctorWeeklyTemplate, 'tpl');

                    let tplCondStr = '';
                    const tplParams: any = {};
                    removedIntervals.forEach((interval, index) => {
                        const orCond = `(day_of_week = :tdow${index} AND start_time < :tend${index} AND end_time > :tstart${index})`;
                        tplCondStr += (index === 0) ? orCond : ` OR ${orCond}`;
                        tplParams[`tdow${index}`] = interval.dayOfWeek;
                        tplParams[`tstart${index}`] = interval.startTime;
                        tplParams[`tend${index}`] = interval.endTime;
                    });
                    deleteTplQb.where(`(${tplCondStr})`, tplParams);
                    await deleteTplQb.execute();
                }

                const verifyLock = await this.cacheManager.get('Lock:UpdateSchedule');
                if (verifyLock != lockId) {
                    return {
                        ok: false,
                        status: 500,
                        error: 'Lock update lịch bị timeout hoặc chiếm dụng! Rollback an toàn.'
                    };
                }

                await queryRunner.commitTransaction();

                await this.cacheManager.del('openingTime');

                return {
                    ok: true,
                    status: 200,
                    message: 'Cập nhật thời gian mở cửa thành công',
                    data: {
                        removedIntervals,
                        addedIntervals // Có thể emit event hoặc trả về cho client để gen ca khám mới
                    }
                };
            } catch (e: any) {
                await queryRunner.rollbackTransaction();
                return {
                    ok: false,
                    status: 500,
                    error: e.message || 'Lỗi hệ thống khi cập nhật lịch'
                };
            } finally {
                const verifyLock = await this.cacheManager.get('Lock:UpdateSchedule');

                if (verifyLock === lockId) {
                    await this.cacheManager.del('Lock:UpdateSchedule');
                }

                await queryRunner.release();
            }
        } catch (e: any) {
            return {
                ok: false,
                status: 500,
                error: e.message || 'Lỗi hệ thống'
            };
        }
    }
}
