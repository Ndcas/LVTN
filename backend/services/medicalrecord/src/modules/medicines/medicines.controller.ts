import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MedicinesService } from './medicines.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class MedicinesController {
  constructor(
    private readonly medicinesService: MedicinesService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'medicalrecord_service',
      correlationId: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lấy danh sách thuốc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {string} [data.keyword] - Từ khóa tìm kiếm
   * @param {string} [data.isActive] - Trạng thái thuốc ('0' hoặc '1')
   */
  @GrpcMethod('MedicalRecordService', 'GetAllMedicines')
  async getAllMedicines(data: any) {
    try {
      this.processLog('GetAllMedicines', data.correlationId, 'Nhận yêu cầu lấy danh sách thuốc');

      const result = await this.medicinesService.getAll(data);

      this.processLog('GetAllMedicines', data.correlationId, 'Hoàn thành lấy danh sách thuốc');

      return result;
    } catch (e) {
      this.processLog('GetAllMedicines', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy chi tiết thuốc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {number} data.id - ID thuốc
   */
  @GrpcMethod('MedicalRecordService', 'GetMedicineById')
  async getMedicineById(data: any) {
    try {
      this.processLog('GetMedicineById', data.correlationId, 'Nhận yêu cầu lấy chi tiết thuốc');

      const result = await this.medicinesService.getById(data);

      this.processLog('GetMedicineById', data.correlationId, 'Hoàn thành lấy chi tiết thuốc');

      return result;
    } catch (e) {
      this.processLog('GetMedicineById', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Tạo thuốc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {string} data.name - Tên thuốc
   * @param {string} data.unit - Đơn vị tính
   * @param {number} data.pricePerUnit - Giá mỗi đơn vị
   */
  @GrpcMethod('MedicalRecordService', 'CreateMedicine')
  async createMedicine(data: any) {
    try {
      this.processLog('CreateMedicine', data.correlationId, 'Nhận yêu cầu thêm thuốc');

      const result = await this.medicinesService.create(data);

      this.processLog('CreateMedicine', data.correlationId, 'Hoàn thành thêm thuốc');

      return result;
    } catch (e) {
      this.processLog('CreateMedicine', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật thuốc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {number} data.id - ID thuốc
   * @param {string} [data.name] - Tên thuốc
   * @param {string} [data.unit] - Đơn vị tính
   * @param {number} [data.pricePerUnit] - Giá mỗi đơn vị
   */
  @GrpcMethod('MedicalRecordService', 'UpdateMedicine')
  async updateMedicine(data: any) {
    try {
      this.processLog('UpdateMedicine', data.correlationId, 'Nhận yêu cầu cập nhật thuốc');

      const result = await this.medicinesService.update(data);

      this.processLog('UpdateMedicine', data.correlationId, 'Hoàn thành cập nhật thuốc');

      return result;
    } catch (e) {
      this.processLog('UpdateMedicine', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Đổi trạng thái thuốc qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {number} data.id - ID thuốc
   * @param {string} data.isActive - Trạng thái cần đổi ('0' hoặc '1')
   */
  @GrpcMethod('MedicalRecordService', 'ToggleMedicineActive')
  async toggleMedicineActive(data: any) {
    try {
      this.processLog('ToggleMedicineActive', data.correlationId, 'Nhận yêu cầu cập nhật trạng thái thuốc');

      const result = await this.medicinesService.toggleActive(data);

      this.processLog('ToggleMedicineActive', data.correlationId, 'Hoàn thành cập nhật trạng thái thuốc');

      return result;
    } catch (e) {
      this.processLog('ToggleMedicineActive', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }
}
