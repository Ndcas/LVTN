import { Disease } from "src/modules/diseases/entities/disease.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Prescription } from "./prescription.entity";

@Entity('medical_records')
export class MedicalRecord {
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
        name: 'doctor_id',
        type: 'int'
    })
    doctorId: number;

    @Column({
        name: 'visit_date',
        type: 'date'
    })
    visitDate: string;

    @Column({
        name: 'clinical_indicators',
        type: 'text'
    })
    clinicalIndicators: string;

    @Column({
        name: 'disease_id',
        type: 'int',
        nullable: true
    })
    diseaseId: number;

    @ManyToOne(() => Disease, (disease) => disease.medicalRecords)
    @JoinColumn({ name: 'disease_id' })
    disease: Disease;

    @Column({
        name: 'diagnose_detail',
        type: 'text'
    })
    diagnoseDetail: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToOne(() => Prescription, (prescription) => prescription.record)
    prescription: Prescription;
}
