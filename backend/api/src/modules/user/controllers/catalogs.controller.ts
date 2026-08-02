import { Controller, Post, Get, Patch, Body, Req, Param, Inject, HttpException, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UserService } from '../user.service';
import { type Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateSpecialtyDto } from '../dtos/create-specialty.dto';
import { UpdateSpecialtyDto } from '../dtos/update-specialty.dto';
import { CreateDegreeDto } from '../dtos/create-degree.dto';
import { UpdateDegreeDto } from '../dtos/update-degree.dto';

@Controller('catalogs')
export class CatalogsController {
  constructor(private usersService: UserService, @Inject('LOG_SERVICE') private logClient: ClientProxy) { }

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
   * Lấy danh sách roles (read-only)
   * @param {Request} req - Express request object (để lấy correlation-id)
   */
  @Get('roles')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async getAllRoles(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllRoles', correlationId, 'Nhận được yêu cầu lấy danh sách roles');

    const result = await this.usersService.getAllRoles({ correlationId });

    if (!result.ok) {
      this.processLog('GetAllRoles', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllRoles', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy danh sách chuyên khoa
   * @param {Request} req - Express request object
   */
  @Get('specialties')
  @UseGuards(AccessGuard)
  @Roles(['Admin', 'Patient'])
  async getAllSpecialties(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllSpecialties', correlationId, 'Nhận được yêu cầu lấy danh sách chuyên khoa');

    const result = await this.usersService.getAllSpecialties({ correlationId });

    if (!result.ok) {
      this.processLog('GetAllSpecialties', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllSpecialties', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Tạo chuyên khoa mới
   * @param {Object} body - Dữ liệu chuyên khoa cần tạo
   * @param {string} body.name - Tên chuyên khoa
   * @param {string} body.code - Mã chuyên khoa
   * @param {string} [body.description] - Mô tả (tùy chọn)
   * @param {number} [body.defaultFee] - Phí khám mặc định (tùy chọn)
   * @param {Request} req - Express request object
   */
  @Post('specialties')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async createSpecialty(@Body() body: CreateSpecialtyDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateSpecialty', correlationId, 'Nhận được yêu cầu tạo chuyên khoa');

    const result = await this.usersService.createSpecialty({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('CreateSpecialty', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateSpecialty', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;
    return data;
  }

  /**
   * Cập nhật chuyên khoa
   * @param {number} id - ID chuyên khoa
   * @param {Object} body - Dữ liệu cần cập nhật
   * @param {string} [body.name] - Tên chuyên khoa
   * @param {string} [body.code] - Mã chuyên khoa
   * @param {string} [body.description] - Mô tả
   * @param {number} [body.defaultFee] - Phí khám mặc định
   * @param {Request} req - Express request object
   */
  @Patch('specialties/:id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async updateSpecialty(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSpecialtyDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('UpdateSpecialty', correlationId, 'Nhận được yêu cầu cập nhật chuyên khoa');

    const result = await this.usersService.updateSpecialty({ id, ...body, correlationId });

    if (!result.ok) {
      this.processLog('UpdateSpecialty', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateSpecialty', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy danh sách bằng cấp
   * @param {Request} req - Express request object
   */
  @Get('degrees')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async getAllDegrees(@Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllDegrees', correlationId, 'Nhận được yêu cầu lấy danh sách bằng cấp');

    const result = await this.usersService.getAllDegrees({ correlationId });

    if (!result.ok) {
      this.processLog('GetAllDegrees', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllDegrees', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;
    return data;
  }

  /**
   * Tạo bằng cấp mới
   * @param {Object} body - Dữ liệu bằng cấp cần tạo
   * @param {string} body.name - Tên bằng cấp
   * @param {string} [body.description] - Mô tả (tùy chọn)
   * @param {Request} req - Express request object
   */
  @Post('degrees')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async createDegree(@Body() body: CreateDegreeDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateDegree', correlationId, 'Nhận được yêu cầu tạo bằng cấp');

    const result = await this.usersService.createDegree({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('CreateDegree', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateDegree', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Cập nhật bằng cấp
   * @param {number} id - ID bằng cấp
   * @param {Object} body - Dữ liệu cập nhật bằng cấp
   * @param {string} [body.name] - Tên bằng cấp
   * @param {string} [body.description] - Mô tả
   * @param {Request} req - Express request object
   */
  @Patch('degrees/:id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async updateDegree(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDegreeDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('UpdateDegree', correlationId, 'Nhận được yêu cầu cập nhật bằng cấp');

    const result = await this.usersService.updateDegree({ id, ...body, correlationId });

    if (!result.ok) {
      this.processLog('UpdateDegree', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateDegree', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
