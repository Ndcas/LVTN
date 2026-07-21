import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Medicine } from "src/modules/medicines/entities/medicine.entity";
import { MedicalRecord } from "./medical-record.entity";

@Entity('prescription_details')
export class PrescriptionDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'record_id',
        type: 'int'
    })
    recordId: number;

    @ManyToOne(() => MedicalRecord, (record) => record.prescriptionDetails)
    @JoinColumn({ name: 'record_id' })
    record: MedicalRecord;

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
