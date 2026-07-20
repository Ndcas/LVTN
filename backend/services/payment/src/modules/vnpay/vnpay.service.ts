import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentTransaction } from "./entities/payment-transaction.entity";
import { Repository } from "typeorm";
import { DataSource } from "typeorm/browser";

@Injectable()
export class VnpayService {
    constructor(
        @InjectRepository(PaymentTransaction) private paymentTransactionRepository: Repository<PaymentTransaction>,
        private dataSource: DataSource
    ) { }

    async createTransaction(data: any) {
        const { id, ip } = data;
    }
}