import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface UserServiceClient {

  // Auth
  getRegisterOtp(data: any): Observable<any>;
  register(data: any): Observable<any>;
  login(data: any): Observable<any>;
  refresh(data: any): Observable<any>;
  logout(data: any): Observable<any>;
  getForgotPasswordOtp(data: any): Observable<any>;
  forgotPassword(data: any): Observable<any>;
  updateFcmToken(data: any): Observable<any>;

  // CRUD Users
  getAllUsers(data: any): Observable<any>;
  getUserById(data: any): Observable<any>;
  createUser(data: any): Observable<any>;
  updateUser(data: any): Observable<any>;
  toggleUserActive(data: any): Observable<any>;

  // CRUD Doctors
  getAllDoctors(data: any): Observable<any>;
  getDoctorById(data: any): Observable<any>;
  createDoctor(data: any): Observable<any>;
  updateDoctor(data: any): Observable<any>;

  // Catalogs
  getAllSpecialties(data: any): Observable<any>;
  createSpecialty(data: any): Observable<any>;
  updateSpecialty(data: any): Observable<any>;
  getAllDegrees(data: any): Observable<any>;
  createDegree(data: any): Observable<any>;
  updateDegree(data: any): Observable<any>;
  getAllRoles(data: any): Observable<any>;
}

@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@Inject('USER_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  // === Auth ===
  getRegisterOtp(data: any) {
    return lastValueFrom(this.userService.getRegisterOtp(data));
  }

  register(data: any) {
    return lastValueFrom(this.userService.register(data));
  }

  login(data: any) {
    return lastValueFrom(this.userService.login(data));
  }

  refresh(data: any) {
    return lastValueFrom(this.userService.refresh(data));
  }

  logout(data: any) {
    return lastValueFrom(this.userService.logout(data));
  }

  getForgotPasswordOtp(data: any) {
    return lastValueFrom(this.userService.getForgotPasswordOtp(data));
  }

  forgotPassword(data: any) {
    return lastValueFrom(this.userService.forgotPassword(data));
  }

  updateFcmToken(data: any) {
    return lastValueFrom(this.userService.updateFcmToken(data));
  }

  // === CRUD Users ===
  getAllUsers(data: any) {
    return lastValueFrom(this.userService.getAllUsers(data));
  }

  getUserById(data: any) {
    return lastValueFrom(this.userService.getUserById(data));
  }

  updateUser(data: any) {
    return lastValueFrom(this.userService.updateUser(data));
  }

  async createUser(data: any) {
    return await lastValueFrom(this.userService.createUser(data));
  }

  toggleUserActive(data: any) {
    return lastValueFrom(this.userService.toggleUserActive(data));
  }

  // === CRUD Doctors ===
  getAllDoctors(data: any) {
    return lastValueFrom(this.userService.getAllDoctors(data));
  }

  getDoctorById(data: any) {
    return lastValueFrom(this.userService.getDoctorById(data));
  }

  createDoctor(data: any) {
    return lastValueFrom(this.userService.createDoctor(data));
  }

  updateDoctor(data: any) {
    return lastValueFrom(this.userService.updateDoctor(data));
  }

  // === Catalogs ===
  getAllSpecialties(data: any) {
    return lastValueFrom(this.userService.getAllSpecialties(data));
  }

  createSpecialty(data: any) {
    return lastValueFrom(this.userService.createSpecialty(data));
  }

  updateSpecialty(data: any) {
    return lastValueFrom(this.userService.updateSpecialty(data));
  }

  getAllDegrees(data: any) {
    return lastValueFrom(this.userService.getAllDegrees(data));
  }

  createDegree(data: any) {
    return lastValueFrom(this.userService.createDegree(data));
  }

  updateDegree(data: any) {
    return lastValueFrom(this.userService.updateDegree(data));
  }

  getAllRoles(data: any) {
    return lastValueFrom(this.userService.getAllRoles(data));
  }
}
