import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Invoice } from "../../invoices/entities/invoice.entity";

export enum Status {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

@Entity('payment_transactions')
export class PaymentTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'invoice_id',
        type: 'int'
    })
    invoiceId: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.paymentTransactions)
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;

    @Column({
        name: 'txn_ref',
        type: 'varchar',
        length: 100,
        unique: true
    })
    txnRef: string;

    @Column({
        name: 'transaction_no',
        type: 'varchar',
        length: 100,
        nullable: true
    })
    transactionNo: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2
    })
    amount: number;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.PENDING
    })
    status: Status;

    @Column({
        name: 'payment_raw_log',
        type: 'text',
        nullable: true
    })
    paymentRawLog: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
