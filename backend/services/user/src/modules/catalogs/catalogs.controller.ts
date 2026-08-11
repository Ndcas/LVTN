import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CatalogsService } from './catalogs.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class CatalogsController {
  constructor(private catalogsService: CatalogsService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'user_service',
      correlationID: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Lấy danh sách tất cả roles qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllRoles')
  async getAllRoles(data: any) {
    try {
      this.processLog('GetAllRoles', data.correlationId, 'Nhận được yêu cầu lấy danh sách roles');

      const result = await this.catalogsService.getAllRoles(data);

      this.processLog('GetAllRoles', data.correlationId, 'Kết thúc xử lý lấy danh sách roles');

      return result;
    } catch (e) {
      this.processLog('GetAllRoles', data.correlationId, `Lỗi khi xử lý lấy danh sách roles: ${e}`, 'error');

      return { ok: false, status: 500, error: 'Lỗi hệ thống' };
    }
  }

  /**
   * Lấy danh sách tất cả chuyên khoa qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllSpecialties')
  async getAllSpecialties(data: any) {
    try {
      this.processLog('GetAllSpecialties', data.correlationId, 'Nhận được yêu cầu lấy danh sách chuyên khoa');

      const result = await this.catalogsService.getAllSpecialties(data);

      this.processLog('GetAllSpecialties', data.correlationId, 'Kết thúc xử lý lấy danh sách chuyên khoa');

      return result;
    } catch (e) {
      this.processLog('GetAllSpecialties', data.correlationId, `Lỗi khi xử lý lấy danh sách chuyên khoa: ${e}`, 'error');

      return { ok: false, status: 500, error: 'Lỗi hệ thống' };
    }
  }

  /**
   * Tạo chuyên khoa mới qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.name - Tên chuyên khoa
   * @param {string} data.code - Mã chuyên khoa
   * @param {string} data.description - Mô tả
   * @param {number} data.defaultFee - Phí khám mặc định
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'CreateSpecialty')
  async createSpecialty(data: any) {
    try {
      this.processLog('CreateSpecialty', data.correlationId, 'Nhận được yêu cầu tạo chuyên khoa');

      const result = await this.catalogsService.createSpecialty(data);

      this.processLog('CreateSpecialty', data.correlationId, 'Kết thúc xử lý tạo chuyên khoa');

      return result;
    } catch (e) {
      this.processLog('CreateSpecialty', data.correlationId, `Lỗi khi xử lý tạo chuyên khoa: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật chuyên khoa qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID chuyên khoa
   * @param {string} data.name - Tên mới
   * @param {string} data.code - Mã mới
   * @param {string} data.description - Mô tả mới
   * @param {number} data.defaultFee - Phí khám mới
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'UpdateSpecialty')
  async updateSpecialty(data: any) {
    try {
      this.processLog('UpdateSpecialty', data.correlationId, 'Nhận được yêu cầu cập nhật chuyên khoa');

      const result = await this.catalogsService.updateSpecialty(data);

      this.processLog('UpdateSpecialty', data.correlationId, 'Kết thúc xử lý cập nhật chuyên khoa');

      return result;
    } catch (e) {
      this.processLog('UpdateSpecialty', data.correlationId, `Lỗi khi xử lý cập nhật chuyên khoa: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy danh sách bằng cấp qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllDegrees')
  async getAllDegrees(data: any) {
    try {
      this.processLog('GetAllDegrees', data.correlationId, 'Nhận được yêu cầu lấy danh sách bằng cấp');

      const result = await this.catalogsService.getAllDegrees(data);

      this.processLog('GetAllDegrees', data.correlationId, 'Kết thúc xử lý lấy danh sách bằng cấp');

      return result;
    } catch (e) {
      this.processLog('GetAllDegrees', data.correlationId, `Lỗi khi xử lý lấy danh sách bằng cấp: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Tạo bằng cấp mới qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.name - Tên bằng cấp
   * @param {string} data.description - Mô tả
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'CreateDegree')
  async createDegree(data: any) {
    try {
      this.processLog('CreateDegree', data.correlationId, 'Nhận được yêu cầu tạo bằng cấp');

      const result = await this.catalogsService.createDegree(data);

      this.processLog('CreateDegree', data.correlationId, 'Kết thúc xử lý tạo bằng cấp');

      return result;
    } catch (e) {
      this.processLog('CreateDegree', data.correlationId, `Lỗi khi xử lý tạo bằng cấp: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật bằng cấp qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID bằng cấp
   * @param {string} data.name - Tên mới
   * @param {string} data.description - Mô tả mới
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'UpdateDegree')
  async updateDegree(data: any) {
    try {
      this.processLog('UpdateDegree', data.correlationId, 'Nhận được yêu cầu cập nhật bằng cấp');

      const result = await this.catalogsService.updateDegree(data);

      this.processLog('UpdateDegree', data.correlationId, 'Kết thúc xử lý cập nhật bằng cấp');

      return result;
    } catch (e) {
      this.processLog('UpdateDegree', data.correlationId, `Lỗi khi xử lý cập nhật bằng cấp: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }
}
