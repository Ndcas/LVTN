import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PaymentTransaction } from "../../vnpay/entities/payment-transaction.entity";

export enum PaymentMethod {
    CASH = 'CASH',
    VNPAY = 'VNPAY'
}

export enum Status {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    CANCELED = 'CANCELED'
}

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'booking_id',
        type: 'int',
        unique: true
    })
    bookingId: number;

    @Column({
        name: 'patient_id',
        type: 'int'
    })
    patientId: number;

    @Column({
        name: 'examination_fee',
        type: 'decimal',
        precision: 10,
        scale: 2
    })
    examinationFee: number;

    @Column({
        name: 'medicine_fee',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0
    })
    medicineFee: number;

    @Column({
        name: 'total_amount',
        type: 'decimal',
        precision: 10,
        scale: 2
    })
    totalAmount: number;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        nullable: true
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.UNPAID
    })
    status: Status;

    @Column({
        name: 'cashier_id',
        type: 'int',
        nullable: true
    })
    cashierId: number;

    @Column({
        name: 'paid_at',
        type: 'timestamp',
        nullable: true
    })
    paidAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => PaymentTransaction, (transaction) => transaction.invoice)
    paymentTransactions: PaymentTransaction[];
}
