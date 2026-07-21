import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { PrescriptionDetail } from './entities/prescription-detail.entity';
import { Medicine, IsActive } from '../medicines/entities/medicine.entity';

@Injectable()
export class RecordsService {
    constructor(
        @InjectRepository(MedicalRecord) private medicalRecordRepository: Repository<MedicalRecord>,
        private dataSource: DataSource
    ) { }

    async getByBooking(data: any) {
        const { id } = data;
        const record = await this.medicalRecordRepository.findOne({
            where: { bookingId: id },
            relations: {
                disease: true,
                prescriptionDetails: { medicine: true }
            }
        });

        if (!record) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy bệnh án'
            };
        }

        return {
            ok: true,
            status: 200,
            data: {
                ...record,
                createdAt: record.createdAt.toISOString(),
                prescriptionDetails: record.prescriptionDetails.map(d => ({
                    ...d,
                    priceAtBooking: Number(d.priceAtBooking),
                    medicine: d.medicine.name
                }))
            }
        };
    }

    async getByPatient(data: any) {
        const { id, page = 1, limit = 10 } = data;
        const skip = (page - 1) * limit;

        const [records, total] = await this.medicalRecordRepository.findAndCount({
            where: { patientId: id },
            relations: { disease: true },
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        return {
            ok: true,
            status: 200,
            data: records.map(record => ({
                ...record,
                disease: undefined,
                diseaseName: record.disease?.name,
                createdAt: record.createdAt.toISOString()
            })),
            total,
            page,
            limit
        };
    }

    async create(data: any) {
        const {
            bookingId,
            patientId,
            doctorId,
            visitDate,
            clinicalIndicators,
            diseaseId,
            diagnoseDetail,
            prescriptionDetails
        } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const existingRecord = await queryRunner.manager.findOne(MedicalRecord, {
                where: { bookingId },
                lock: { mode: 'pessimistic_write' }
            });

            if (existingRecord) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 400,
                    error: 'Bệnh án cho lịch hẹn này đã tồn tại'
                };
            }

            let record = queryRunner.manager.create(MedicalRecord, {
                bookingId,
                patientId,
                doctorId,
                visitDate,
                clinicalIndicators,
                diseaseId,
                diagnoseDetail
            });
            record = await queryRunner.manager.save(MedicalRecord, record);

            if (prescriptionDetails && prescriptionDetails.length > 0) {
                const medicineIds = Array.from(new Set(prescriptionDetails.map(detail => detail.medicineId)));
                const medicines = await queryRunner.manager.find(Medicine, {
                    where: {
                        id: In(medicineIds),
                        isActive: IsActive.ACTIVE
                    },
                    lock: { mode: 'pessimistic_read' }
                });

                if (medicines.length != medicineIds.length) {
                    await queryRunner.rollbackTransaction();

                    return {
                        ok: false,
                        status: 400,
                        error: 'Có thuốc không tồn tại hoặc đã ngừng kinh doanh trong đơn thuốc'
                    };
                }

                const medicineMap = new Map(medicines.map(m => [m.id, m]));
                const detailEntities = queryRunner.manager.create(PrescriptionDetail, prescriptionDetails.map(detail => ({
                    recordId: record.id,
                    medicineId: detail.medicineId,
                    quantity: detail.quantity,
                    dosage: detail.dosage,
                    priceAtBooking: medicineMap.get(detail.medicineId)!.pricePerUnit
                })));

                await queryRunner.manager.save(PrescriptionDetail, detailEntities);
            }

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                message: 'Tạo bệnh án thành công',
                id: record.id
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async delete(data: any) {
        const { id } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const record = await queryRunner.manager.findOne(MedicalRecord, {
                where: { id },
                lock: { mode: 'pessimistic_write' }
            });

            if (!record) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 404,
                    error: 'Không tìm thấy bệnh án'
                };
            }

            await queryRunner.manager.delete(PrescriptionDetail, { recordId: id });

            await queryRunner.manager.delete(MedicalRecord, id);

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                message: 'Xóa bệnh án thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
