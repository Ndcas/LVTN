import { Body, Controller, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from '../medical-record.service';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { type Request } from 'express';
import { CreateMedicineDto } from '../dtos/create-medicine.dto';
import { UpdateMedicineDto } from '../dtos/update-medicine.dto';
import { ToggleMedicineActiveDto } from '../dtos/toggle-medicine-active.dto';

@Controller('medicines')
export class MedicinesController {
  constructor(private medicalRecordService: MedicalRecordService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'api_gateway',
      correlationId: correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Lấy danh sách thuốc
   * @param {string} keyword - Từ khóa tìm kiếm theo tên thuốc
   * @param {string} isActive - Trạng thái thuốc ('0' hoặc '1')
   * @param {Request} req - Request object để lấy headers
   */
  @Get()
  @UseGuards(AccessGuard)
  @Roles(['Admin', 'Doctor'])
  async getAllMedicines(@Query('keyword') keyword: string, @Query('isActive') isActive: string, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllMedicines', correlationId, 'Nhận yêu cầu lấy danh sách thuốc');

    const result = await this.medicalRecordService.getAllMedicines({ keyword, isActive, correlationId });

    if (!result.ok) {
      this.processLog('GetAllMedicines', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllMedicines', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy chi tiết thuốc theo ID
   * @param {number} id - ID của thuốc
   * @param {Request} req - Request object để lấy headers
   */
  @Get(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin', 'Doctor'])
  async getMedicineById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetMedicineById', correlationId, 'Nhận yêu cầu lấy chi tiết thuốc');

    const result = await this.medicalRecordService.getMedicineById({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetMedicineById', correlationId, `Thất bại: ${result.error}`, 'warn');
      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetMedicineById', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;
    return data;
  }

  /**
   * Tạo thuốc mới
   * @param {Object} body - Thông tin thuốc cần tạo
   * @param {string} body.name - Tên thuốc
   * @param {string} body.unit - Đơn vị tính
   * @param {number} body.pricePerUnit - Giá mỗi đơn vị
   * @param {Request} req - Request object để lấy headers
   */
  @Post()
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async createMedicine(@Body() body: CreateMedicineDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateMedicine', correlationId, 'Nhận yêu cầu thêm thuốc');

    const result = await this.medicalRecordService.createMedicine({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('CreateMedicine', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateMedicine', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Cập nhật thông tin thuốc
   * @param {number} id - ID của thuốc cần cập nhật
   * @param {Object} body - Thông tin cập nhật
   * @param {string} [body.name] - Tên thuốc
   * @param {string} [body.unit] - Đơn vị tính
   * @param {number} [body.pricePerUnit] - Giá mỗi đơn vị
   * @param {Request} req - Request object để lấy headers
   */
  @Patch(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async updateMedicine(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMedicineDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('UpdateMedicine', correlationId, 'Nhận yêu cầu cập nhật thuốc');

    const result = await this.medicalRecordService.updateMedicine({ ...body, id, correlationId });

    if (!result.ok) {
      this.processLog('UpdateMedicine', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateMedicine', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Đổi trạng thái thuốc (Active/Inactive)
   * @param {number} id - ID của thuốc
   * @param {Object} body - Thông tin trạng thái
   * @param {string} body.isActive - Trạng thái cần đổi ('0' hoặc '1')
   * @param {Request} req - Request object để lấy headers
   */
  @Patch('toggle/:id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async toggleMedicineActive(@Param('id', ParseIntPipe) id: number, @Body() body: ToggleMedicineActiveDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('ToggleMedicineActive', correlationId, 'Nhận yêu cầu đổi trạng thái thuốc');

    const result = await this.medicalRecordService.toggleMedicineActive({ ...body, id, correlationId });

    if (!result.ok) {
      this.processLog('ToggleMedicineActive', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('ToggleMedicineActive', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
