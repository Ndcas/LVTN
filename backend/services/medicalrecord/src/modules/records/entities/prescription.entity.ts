import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicalRecord } from "./medical-record.entity";
import { PrescriptionDetail } from "./prescription-detail.entity";

@Entity('prescriptions')
export class Prescription {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'record_id',
        type: 'int',
        unique: true
    })
    recordId: number;

    @OneToOne(() => MedicalRecord, (record) => record.prescription)
    @JoinColumn({ name: 'record_id' })
    record: MedicalRecord;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => PrescriptionDetail, (detail) => detail.prescription)
    prescriptionDetails: PrescriptionDetail[];
}
