import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Prescription } from "./prescription.entity";
import { Medicine } from "src/modules/medicines/entities/medicine.entity";

@Entity('prescription_details')
export class PrescriptionDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'prescription_id',
        type: 'int'
    })
    prescriptionId: number;

    @ManyToOne(() => Prescription, (prescription) => prescription.prescriptionDetails)
    @JoinColumn({ name: 'prescription_id' })
    prescription: Prescription;

    @Column({
        name: 'medicine_id',
        type: 'int'
    })
    medicineId: number;

    @ManyToOne(() => Medicine, (medicine) => medicine.prescriptionDetails)
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column({
        name: 'quantity',
        type: 'int'
    })
    quantity: number;

    @Column({
        name: 'price_at_booking',
        type: 'decimal',
        precision: 10,
        scale: 2
    })
    priceAtBooking: number;

    @Column({
        name: 'dosage',
        type: 'varchar',
        length: 255
    })
    dosage: string;
}
