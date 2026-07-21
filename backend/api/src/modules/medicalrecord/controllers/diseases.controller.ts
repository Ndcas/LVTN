import { Body, Controller, Delete, Get, HttpException, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MedicalRecordService } from '../medical-record.service';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { type Request } from 'express';
import { CreateDiseaseDto } from '../dtos/create-disease.dto';
import { UpdateDiseaseDto } from '../dtos/update-disease.dto';

@Controller('diseases')
export class DiseasesController {
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
   * Lấy danh sách bệnh lý
   * @param {string} keyword - Từ khóa tìm kiếm theo tên hoặc mã bệnh lý
   * @param {Request} req - Request object để lấy headers
   */
  @Get()
  @UseGuards(AccessGuard)
  async getAllDiseases(@Query('keyword') keyword: string, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllDiseases', correlationId, 'Nhận yêu cầu lấy danh sách bệnh lý');

    const result = await this.medicalRecordService.getAllDiseases({ keyword, correlationId });

    if (!result.ok) {
      this.processLog('GetAllDiseases', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllDiseases', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy chi tiết bệnh lý theo ID
   * @param {number} id - ID của bệnh lý
   * @param {Request} req - Request object để lấy headers
   */
  @Get(':id')
  @UseGuards(AccessGuard)
  async getDiseaseById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetDiseaseById', correlationId, 'Nhận yêu cầu lấy chi tiết bệnh lý');

    const result = await this.medicalRecordService.getDiseaseById({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetDiseaseById', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetDiseaseById', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Tạo bệnh lý mới
   * @param {Object} body - Thông tin bệnh lý cần tạo
   * @param {string} body.name - Tên bệnh lý
   * @param {string} body.diseaseCode - Mã bệnh lý
   * @param {string} [body.description] - Mô tả
   * @param {Request} req - Request object để lấy headers
   */
  @Post()
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async createDisease(@Body() body: CreateDiseaseDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateDisease', correlationId, 'Nhận yêu cầu tạo bệnh lý');

    const result = await this.medicalRecordService.createDisease({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('CreateDisease', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateDisease', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Cập nhật thông tin bệnh lý
   * @param {number} id - ID của bệnh lý cần cập nhật
   * @param {Object} body - Thông tin cập nhật
   * @param {string} [body.name] - Tên bệnh lý
   * @param {string} [body.diseaseCode] - Mã bệnh lý
   * @param {string} [body.description] - Mô tả
   * @param {Request} req - Request object để lấy headers
   */
  @Patch(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async updateDisease(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDiseaseDto,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('UpdateDisease', correlationId, 'Nhận yêu cầu cập nhật bệnh lý');

    const result = await this.medicalRecordService.updateDisease({ ...body, id, correlationId });

    if (!result.ok) {
      this.processLog('UpdateDisease', correlationId, `Thất bại: ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateDisease', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
