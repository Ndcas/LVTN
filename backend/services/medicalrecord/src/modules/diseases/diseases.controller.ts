import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DiseasesService } from './diseases.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class DiseasesController {
  constructor(
    private readonly diseasesService: DiseasesService,
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
   * Lấy danh sách bệnh lý qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {string} [data.keyword] - Từ khóa tìm kiếm theo tên hoặc mã bệnh lý
   */
  @GrpcMethod('MedicalRecordService', 'GetAllDiseases')
  async getAllDiseases(data: any) {
    try {
      this.processLog('GetAllDiseases', data.correlationId, 'Nhận yêu cầu lấy danh sách bệnh lý');

      const result = await this.diseasesService.getAll(data);

      this.processLog('GetAllDiseases', data.correlationId, 'Hoàn thành lấy danh sách bệnh lý');

      return result;
    } catch (e) {
      this.processLog('GetAllDiseases', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy chi tiết bệnh lý qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {number} data.id - ID bệnh lý
   */
  @GrpcMethod('MedicalRecordService', 'GetDiseaseById')
  async getDiseaseById(data: any) {
    try {
      this.processLog('GetDiseaseById', data.correlationId, 'Nhận yêu cầu lấy chi tiết bệnh lý');

      const result = await this.diseasesService.getById(data);

      this.processLog('GetDiseaseById', data.correlationId, 'Hoàn thành lấy chi tiết bệnh lý');

      return result;
    } catch (e) {
      this.processLog('GetDiseaseById', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Tạo bệnh lý qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {string} data.name - Tên bệnh lý
   * @param {string} data.diseaseCode - Mã bệnh lý
   * @param {string} [data.description] - Mô tả
   */
  @GrpcMethod('MedicalRecordService', 'CreateDisease')
  async createDisease(data: any) {
    try {
      this.processLog('CreateDisease', data.correlationId, 'Nhận yêu cầu tạo bệnh lý');

      const result = await this.diseasesService.create(data);

      this.processLog('CreateDisease', data.correlationId, 'Hoàn thành tạo bệnh lý');

      return result;
    } catch (e) {
      this.processLog('CreateDisease', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật bệnh lý qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   * @param {number} data.id - ID bệnh lý
   * @param {string} [data.name] - Tên bệnh lý
   * @param {string} [data.diseaseCode] - Mã bệnh lý
   * @param {string} [data.description] - Mô tả
   */
  @GrpcMethod('MedicalRecordService', 'UpdateDisease')
  async updateDisease(data: any) {
    try {
      this.processLog('UpdateDisease', data.correlationId, 'Nhận yêu cầu cập nhật bệnh lý');

      const result = await this.diseasesService.update(data);

      this.processLog('UpdateDisease', data.correlationId, 'Hoàn thành cập nhật bệnh lý');

      return result;
    } catch (e) {
      this.processLog('UpdateDisease', data.correlationId, `Lỗi: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }
}
