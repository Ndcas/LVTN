import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DoctorsService } from './doctors.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

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
   * Lấy danh sách bác sĩ (phân trang + filter) qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.page - Trang hiện tại
   * @param {number} data.limit - Số bản ghi mỗi trang
   * @param {string} data.search - Tìm kiếm theo tên, email, SĐT
   * @param {number} data.specialtyId - Lọc theo chuyên khoa
   * @param {string} data.isActive - Lọc theo trạng thái ('0', '1')
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllDoctors')
  async getAllDoctors(data: any) {
    try {
      this.processLog('GetAllDoctors', data.correlationId, 'Nhận được yêu cầu lấy danh sách bác sĩ');

      const result = await this.doctorsService.getAll(data);

      this.processLog('GetAllDoctors', data.correlationId, 'Kết thúc xử lý lấy danh sách bác sĩ');

      return result;
    } catch (e) {
      this.processLog('GetAllDoctors', data.correlationId, `Lỗi khi xử lý lấy danh sách bác sĩ: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy thông tin bác sĩ theo ID (user_id) qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - user_id của bác sĩ
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetDoctorById')
  async getDoctorById(data: any) {
    try {
      this.processLog('GetDoctorById', data.correlationId, 'Nhận được yêu cầu lấy thông tin bác sĩ');

      const result = await this.doctorsService.getById(data);

      this.processLog('GetDoctorById', data.correlationId, 'Kết thúc xử lý lấy thông tin bác sĩ');

      return result;
    } catch (e) {
      this.processLog('GetDoctorById', data.correlationId, `Lỗi khi xử lý lấy thông tin bác sĩ: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Tạo bác sĩ mới qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.email - Email
   * @param {string} data.password - Mật khẩu
   * @param {string} data.phone - Số điện thoại
   * @param {string} data.fullName - Họ tên
   * @param {string} data.gender - Giới tính
   * @param {string} data.dob - Ngày sinh
   * @param {string} data.address - Địa chỉ
   * @param {number} data.specialtyId - ID chuyên khoa
   * @param {number} data.degreeId - ID bằng cấp
   * @param {number} data.experienceYears - Số năm kinh nghiệm
   * @param {string} data.biography - Tiểu sử
   * @param {string} data.workType - Loại hình khám (ONLINE/OFFLINE/BOTH)
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'CreateDoctor')
  async createDoctor(data: any) {
    try {
      this.processLog('CreateDoctor', data.correlationId, 'Nhận được yêu cầu tạo bác sĩ');

      const result = await this.doctorsService.create(data);

      this.processLog('CreateDoctor', data.correlationId, 'Kết thúc xử lý tạo bác sĩ');

      return result;
    } catch (e) {
      this.processLog('CreateDoctor', data.correlationId, `Lỗi khi xử lý tạo bác sĩ: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Cập nhật thông tin bác sĩ qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - user_id của bác sĩ
   * @param {string} data.phone - SĐT mới
   * @param {string} data.email - Email mới
   * @param {string} data.fullName - Họ tên mới
   * @param {string} data.gender - Giới tính mới
   * @param {string} data.dob - Ngày sinh mới
   * @param {string} data.address - Địa chỉ mới
   * @param {number} data.specialtyId - Chuyên khoa mới
   * @param {number} data.degreeId - Bằng cấp mới
   * @param {number} data.experienceYears - Năm kinh nghiệm mới
   * @param {string} data.biography - Tiểu sử mới
   * @param {string} data.workType - Loại hình khám mới
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'UpdateDoctor')
  async updateDoctor(data: any) {
    try {
      this.processLog('UpdateDoctor', data.correlationId, 'Nhận được yêu cầu cập nhật bác sĩ');

      const result = await this.doctorsService.update(data);

      this.processLog('UpdateDoctor', data.correlationId, 'Kết thúc xử lý cập nhật bác sĩ');

      return result;
    } catch (e) {
      this.processLog('UpdateDoctor', data.correlationId, `Lỗi khi xử lý cập nhật bác sĩ: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy danh sách bác sĩ (id và fullName) theo chuyên khoa qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number} data.id - ID chuyên khoa
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllDoctorNamesBySpecialtyId')
  async getAllDoctorNamesBySpecialtyId(data: any) {
    try {
      this.processLog('GetAllDoctorNamesBySpecialtyId', data.correlationId, 'Nhận được yêu cầu lấy danh sách tên bác sĩ theo chuyên khoa');

      const result = await this.doctorsService.getAllNamesBySpecialtyId(data);

      this.processLog('GetAllDoctorNamesBySpecialtyId', data.correlationId, 'Kết thúc xử lý lấy danh sách tên bác sĩ theo chuyên khoa');

      return result;
    } catch (e) {
      this.processLog('GetAllDoctorNamesBySpecialtyId', data.correlationId, `Lỗi khi xử lý lấy danh sách tên bác sĩ theo chuyên khoa: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }

  /**
   * Lấy danh sách bác sĩ (id và fullName) theo ID qua gRPC
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {number[]} data.ids - Mảng ID bác sĩ
   * @param {string} data.correlationId - ID theo dõi request
   */
  @GrpcMethod('UserService', 'GetAllDoctorNamesByIds')
  async getAllDoctorNamesByIds(data: any) {
    try {
      this.processLog('GetAllDoctorNamesByIds', data.correlationId, 'Nhận được yêu cầu lấy danh sách tên bác sĩ theo ID');

      const result = await this.doctorsService.getAllNamesByIds(data);

      this.processLog('GetAllDoctorNamesByIds', data.correlationId, 'Kết thúc xử lý lấy danh sách tên bác sĩ theo ID');

      return result;
    } catch (e) {
      this.processLog('GetAllDoctorNamesByIds', data.correlationId, `Lỗi khi xử lý lấy danh sách tên bác sĩ theo ID: ${e}`, 'error');

      return {
        ok: false,
        status: 500,
        error: 'Lỗi hệ thống'
      };
    }
  }
}
