import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Invoice, Status, PaymentMethod } from "./entities/invoice.entity";
import { Repository, DataSource } from "typeorm";

@Injectable()
export class InvoicesService {
    constructor(@InjectRepository(Invoice) private invoiceRepository: Repository<Invoice>, private dataSource: DataSource) { }

    async getAll(data: any) {
        const { page = 1, limit = 10, status, patientId } = data;
        const skip = (page - 1) * limit;
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

        if (status) {
            queryBuilder.andWhere('invoice.status = :status', { status });
        }
        if (patientId) {
            queryBuilder.andWhere('invoice.patientId = :patientId', { patientId });
        }

        queryBuilder.orderBy('invoice.createdAt', 'DESC');

        const [invoices, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

        return {
            ok: true,
            status: 200,
            data: invoices.map(invoice => ({
                ...invoice,
                examinationFee: Number(invoice.examinationFee),
                medicineFee: Number(invoice.medicineFee),
                totalAmount: Number(invoice.totalAmount),
                paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
                createdAt: invoice.createdAt.toISOString(),
                updatedAt: invoice.updatedAt.toISOString()
            })),
            total,
            page,
            limit
        };
    }

    async getById(data: any) {
        const { id } = data;
        const invoice = await this.invoiceRepository.findOne({
            where: { id }
        });

        if (!invoice) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy hóa đơn'
            };
        }

        return {
            ok: true,
            status: 200,
            data: {
                ...invoice,
                examinationFee: Number(invoice.examinationFee),
                medicineFee: Number(invoice.medicineFee),
                totalAmount: Number(invoice.totalAmount),
                paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
                createdAt: invoice.createdAt.toISOString(),
                updatedAt: invoice.updatedAt.toISOString()
            }
        };
    }

    async createInvoice(data: any) {
        const { bookingId, patientId, examinationFee, medicineFee, totalAmount } = data;
        const existing = await this.invoiceRepository.exists({
            where: { bookingId }
        });

        if (existing) {
            return {
                ok: false,
                status: 400,
                error: 'Hóa đơn cho ca khám này đã tồn tại'
            };
        }

        const newInvoice = this.invoiceRepository.create({ bookingId, patientId, examinationFee, medicineFee, totalAmount });
        const saved = await this.invoiceRepository.save(newInvoice);

        return {
            ok: true,
            status: 200,
            message: 'Tạo hóa đơn thành công',
            id: saved.id
        };
    }

    async markCashPaid(data: any) {
        const { id, cashierId } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const invoice = await queryRunner.manager.findOne(Invoice, {
                where: {
                    id,
                    status: Status.UNPAID
                },
                lock: { mode: 'pessimistic_write' }
            });

            if (!invoice) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 404,
                    error: 'Không tìm thấy hóa đơn'
                };
            }

            invoice.status = Status.PAID;
            invoice.paymentMethod = PaymentMethod.CASH;
            invoice.cashierId = cashierId;
            invoice.paidAt = new Date();

            await queryRunner.manager.save(Invoice, invoice);

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                message: 'Đã xác nhận thanh toán tiền mặt thành công'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteInvoice(data: any) {
        const { id } = data;

        const invoice = await this.invoiceRepository.findOne({
            where: { id }
        });

        if (!invoice) {
            return {
                ok: false,
                status: 404,
                error: 'Không tìm thấy hóa đơn'
            };
        }

        await this.invoiceRepository.remove(invoice);

        return {
            ok: true,
            status: 200,
            message: 'Đã xóa hóa đơn thành công'
        };
    }

    async getUnpaidInvoicesCount(data: any) {
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

        queryBuilder.andWhere('invoice.status = :status', { status: Status.UNPAID });

        if (data.patientId) {
            queryBuilder.andWhere('invoice.patientId = :patientId', { patientId: data.patientId });
        }

        const count = await queryBuilder.getCount();

        return {
            ok: true,
            status: 200,
            count
        };
    }
}