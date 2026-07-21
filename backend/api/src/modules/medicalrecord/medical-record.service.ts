import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface MedicalRecordServiceClient {
  // === Diseases ===
  getAllDiseases(data: any): Observable<any>;
  getDiseaseById(data: any): Observable<any>;
  createDisease(data: any): Observable<any>;
  updateDisease(data: any): Observable<any>;

  // === Medicines ===
  getAllMedicines(data: any): Observable<any>;
  getMedicineById(data: any): Observable<any>;
  createMedicine(data: any): Observable<any>;
  updateMedicine(data: any): Observable<any>;
  toggleMedicineActive(data: any): Observable<any>;

  // === Records ===
  getRecordByBooking(data: any): Observable<any>;
  getRecordsByPatient(data: any): Observable<any>;
}

@Injectable()
export class MedicalRecordService implements OnModuleInit {
  private medicalRecordService: MedicalRecordServiceClient;

  constructor(@Inject('MEDICAL_RECORD_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.medicalRecordService = this.client.getService<MedicalRecordServiceClient>('MedicalRecordService');
  }

  // === Diseases ===
  getAllDiseases(data: any) {
    return lastValueFrom(this.medicalRecordService.getAllDiseases(data));
  }

  getDiseaseById(data: any) {
    return lastValueFrom(this.medicalRecordService.getDiseaseById(data));
  }

  createDisease(data: any) {
    return lastValueFrom(this.medicalRecordService.createDisease(data));
  }

  updateDisease(data: any) {
    return lastValueFrom(this.medicalRecordService.updateDisease(data));
  }

  // === Medicines ===
  getAllMedicines(data: any) {
    return lastValueFrom(this.medicalRecordService.getAllMedicines(data));
  }

  getMedicineById(data: any) {
    return lastValueFrom(this.medicalRecordService.getMedicineById(data));
  }

  createMedicine(data: any) {
    return lastValueFrom(this.medicalRecordService.createMedicine(data));
  }

  updateMedicine(data: any) {
    return lastValueFrom(this.medicalRecordService.updateMedicine(data));
  }

  toggleMedicineActive(data: any) {
    return lastValueFrom(this.medicalRecordService.toggleMedicineActive(data));
  }

  // === Records ===
  getRecordByBooking(data: any) {
    return lastValueFrom(this.medicalRecordService.getRecordByBooking(data));
  }

  getRecordsByPatient(data: any) {
    return lastValueFrom(this.medicalRecordService.getRecordsByPatient(data));
  }
}
