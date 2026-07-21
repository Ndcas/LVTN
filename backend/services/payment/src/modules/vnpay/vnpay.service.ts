import { Injectable } from "@nestjs/common";
import { PaymentTransaction, Status as TransactionStatus } from "../invoices/entities/payment-transaction.entity";
import { DataSource } from "typeorm/browser";
import { ConfigService } from "@nestjs/config";
import { Invoice, Status as InvoiceStatus, PaymentMethod } from "../invoices/entities/invoice.entity";
import { stringify } from "node:querystring";
import { createHmac } from "node:crypto";

@Injectable()
export class VnpayService {
    constructor(
        private configService: ConfigService,
        private dataSource: DataSource
    ) { }

    async createTransaction(data: any) {
        const { id, ip } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const invoice = await queryRunner.manager.findOne(Invoice, {
                where: {
                    id,
                    status: InvoiceStatus.UNPAID
                },
                lock: { mode: 'pessimistic_read' }
            });

            if (!invoice) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: false,
                    status: 404,
                    error: 'Không tìm thấy hóa đơn yêu cầu'
                };
            }

            const createDate = this.getYYYYMMDDHHmmss();
            let txnRef = `${createDate}${id}${Math.round(Math.random() * 100).toString().padStart(3, '0')}`;

            while (true) {
                let existingTxnRef = await queryRunner.manager.findOne(PaymentTransaction, {
                    where: { txnRef },
                    lock: { mode: 'pessimistic_read' }
                });

                if (!existingTxnRef) {
                    break;
                }

                txnRef = `${createDate}${id}${Math.round(Math.random() * 100).toString().padStart(3, '0')}`;
            }

            let paymentTransaction = queryRunner.manager.create(PaymentTransaction, {
                invoiceId: id,
                txnRef,
                amount: invoice.totalAmount
            });

            paymentTransaction = await queryRunner.manager.save(PaymentTransaction, paymentTransaction);
            const vnpPrams = this.sortObject({
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': this.configService.get<string>('VNP_TMNCODE'),
                'vnp_Locale': 'vn',
                'vnp_Currcode': 'VND',
                'vnp_TxnRef': txnRef,
                'vnp_OrderInfo': `Thanh toan cho hoa don ca kham ${id}`,
                'vnp_OrderType': 'other',
                'vnp_Amount': Math.round(invoice.totalAmount * 100),
                'vnp_ReturnUrl': this.configService.get<string>('VNP_RETURNURL'),
                'vnp_IpAddr': ip,
                'vnp_CreateDate': createDate
            });

            const signData = stringify(vnpPrams, '&', '=', {
                encodeURIComponent: (value) => value
            });
            const hmac = createHmac('sha512', this.configService.get<string>('VNP_HASHSECRET')!);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
            vnpPrams['vnp_SecureHash'] = signed;
            const vnpUrl = `${this.configService.get<string>('VNP_URL')}?${stringify(vnpPrams, '&', '=', {
                encodeURIComponent: (value) => value
            })}`;

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                url: vnpUrl
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async validateFrontend(data: any) {
        let query = data.query;
        const secureHash = query['vnp_SecureHash'];

        delete query['vnp_SecureHash'];

        delete query['vnp_SecureHashType'];

        query = this.sortObject(query);
        const secretKey = this.configService.get<string>('VNP_HASHSECRET');
        const signData = stringify(query, '&', '=', {
            encodeURIComponent: (value) => value
        });
        const hmac = createHmac('sha512', secretKey!);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash != signed) {
            return {
                ok: false,
                status: 400,
                error: 'Thông tin gửi về không hợp lệ'
            };
        }

        if (query['vnp_ResponseCode'] == '00') {
            return {
                ok: true,
                status: 200,
                message: 'Giao dịch thành công'
            };
        } else {
            return {
                ok: false,
                status: 400,
                error: 'Giao dịch thất bại'
            };
        }
    }

    async validateBackend(data: any) {
        let query = data.query;
        const secureHash = query['vnp_SecureHash'];
        const txnRef = query['vnp_TxnRef'];
        const transactionNo = query['vnp_TransactionNo'];
        const responseCode = query['vnp_ResponseCode'];

        delete query['vnp_SecureHash'];

        delete query['vnp_SecureHashType'];

        query = this.sortObject(query);
        const secretKey = this.configService.get<string>('VNP_HASHSECRET');
        const signData = stringify(query, '&', '=', {
            encodeURIComponent: (value) => value
        });
        const hmac = createHmac('sha512', secretKey!);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash != signed) {
            return {
                ok: true,
                status: 200,
                data: {
                    RspCode: '97',
                    Message: `Thông tin gửi về không hợp lệ ${txnRef}-${transactionNo}-${responseCode}`
                }
            };
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {
            const transaction = await queryRunner.manager.findOne(PaymentTransaction, {
                where: { txnRef },
                relations: { invoice: true },
                lock: { mode: 'pessimistic_write' }
            });

            if (!transaction) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: true,
                    status: 200,
                    data: {
                        RspCode: '01',
                        Message: `Không tìm thấy giao dịch ${txnRef}-${transactionNo}-${responseCode}`
                    }
                };
            }

            if (Math.round(transaction.amount * 100) != parseInt(query['vnp_Amount'])) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: true,
                    status: 200,
                    data: {
                        RspCode: '04',
                        Message: `Số tiền giao dịch không khớp ${txnRef}-${transactionNo}-${responseCode}`
                    }
                };
            }

            if (transaction.status != TransactionStatus.PENDING) {
                await queryRunner.rollbackTransaction();

                return {
                    ok: true,
                    status: 200,
                    data: {
                        RspCode: '02',
                        Message: `Giao dịch đã được xử lý trước đó ${txnRef}-${transactionNo}-${responseCode}`
                    }
                };
            }

            if (responseCode == '00') {
                transaction.status = TransactionStatus.SUCCESS;
                transaction.invoice.paymentMethod = PaymentMethod.VNPAY;
                transaction.invoice.status = InvoiceStatus.PAID;
                transaction.invoice.paidAt = new Date();

                await queryRunner.manager.save(Invoice, transaction.invoice);
            } else {
                transaction.status = TransactionStatus.FAILED;
            }

            transaction.transactionNo = transactionNo;
            transaction.paymentRawLog = JSON.stringify(query);

            await queryRunner.manager.save(PaymentTransaction, transaction);

            await queryRunner.commitTransaction();

            return {
                ok: true,
                status: 200,
                data: {
                    RspCode: '00',
                    Message: `Xác nhận thành công ${txnRef}-${transactionNo}-${responseCode}`
                }
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private getYYYYMMDDHHmmss() {
        const today = new Date();
        const year = today.getFullYear().toString().padStart(4, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const hour = today.getHours().toString().padStart(2, '0');
        const minute = today.getMinutes().toString().padStart(2, '0');
        const second = today.getSeconds().toString().padStart(2, '0');

        return year + month + day + hour + minute + second;
    }

    private sortObject(obj: any) {
        const sorted = {};
        const str: string[] = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }

        str.sort();

        for (let i = 0; i < str.length; i++) {
            const originalKey = decodeURIComponent(str[i]);
            sorted[str[i]] = encodeURIComponent(obj[originalKey]).replace(/%20/g, '+');
        }

        return sorted;
    }
}