import { Controller, Post, Get, Patch, Body, Req, Param, Query, Inject, HttpException, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { type Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { AccessGuard } from 'src/guards/access.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { UpdateDoctorDto } from './dtos/update-doctor.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly usersService: UserService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

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
   * Lấy danh sách bác sĩ (phân trang, search, filter)
   * @param {string} page - Trang hiện tại
   * @param {string} limit - Số bản ghi mỗi trang
   * @param {string} search - Tìm kiếm theo tên, email, SĐT
   * @param {string} specialtyId - Lọc theo chuyên khoa
   * @param {string} isActive - Lọc theo trạng thái ('0', '1')
   * @param {Request} req - Express request object
   */
  @Get()
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async getAllDoctors(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('specialtyId') specialtyId: string,
    @Query('isActive') isActive: string,
    @Req() req: Request
  ) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetAllDoctors', correlationId, 'Nhận được yêu cầu lấy danh sách bác sĩ');

    const result = await this.usersService.getAllDoctors({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      search: search || undefined,
      specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
      isActive: isActive || undefined,
      correlationId
    });

    if (!result.ok) {
      this.processLog('GetAllDoctors', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetAllDoctors', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Lấy thông tin bác sĩ theo user_id
   * @param {number} id - user_id của bác sĩ
   * @param {Request} req - Express request object
   */
  @Get(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async getDoctorById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('GetDoctorById', correlationId, 'Nhận được yêu cầu lấy thông tin bác sĩ');

    const result = await this.usersService.getDoctorById({ id, correlationId });

    if (!result.ok) {
      this.processLog('GetDoctorById', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('GetDoctorById', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Tạo bác sĩ mới
   * @param {Object} body - Dữ liệu bác sĩ (user info + metadata)
   * @param {string} body.email - Email đăng nhập
   * @param {string} body.password - Mật khẩu
   * @param {string} body.phone - Số điện thoại
   * @param {string} body.fullName - Họ và tên
   * @param {string} body.gender - Giới tính ('MALE', 'FEMALE', 'OTHER')
   * @param {string} [body.dob] - Ngày sinh (YYYY-MM-DD)
   * @param {string} [body.address] - Địa chỉ
   * @param {number} body.specialtyId - ID chuyên khoa
   * @param {number} body.degreeId - ID bằng cấp
   * @param {number} [body.experienceYears] - Số năm kinh nghiệm
   * @param {string} [body.biography] - Tiểu sử
   * @param {string} [body.workType] - Loại hình khám ('ONLINE', 'OFFLINE', 'BOTH')
   * @param {Request} req - Express request object
   */
  @Post()
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async createDoctor(@Body() body: CreateDoctorDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('CreateDoctor', correlationId, 'Nhận được yêu cầu tạo bác sĩ');

    const result = await this.usersService.createDoctor({ ...body, correlationId });

    if (!result.ok) {
      this.processLog('CreateDoctor', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('CreateDoctor', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }

  /**
   * Cập nhật thông tin bác sĩ
   * @param {number} id - user_id của bác sĩ
   * @param {Object} body - Dữ liệu cập nhật (partial)
   * @param {string} [body.email] - Email
   * @param {string} [body.phone] - Số điện thoại
   * @param {string} [body.fullName] - Họ và tên
   * @param {string} [body.gender] - Giới tính
   * @param {string} [body.dob] - Ngày sinh
   * @param {string} [body.address] - Địa chỉ
   * @param {number} [body.specialtyId] - ID chuyên khoa
   * @param {number} [body.degreeId] - ID bằng cấp
   * @param {number} [body.experienceYears] - Số năm kinh nghiệm
   * @param {string} [body.biography] - Tiểu sử
   * @param {string} [body.workType] - Loại hình khám
   * @param {Request} req - Express request object
   */
  @Patch(':id')
  @UseGuards(AccessGuard)
  @Roles(['Admin'])
  async updateDoctor(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDoctorDto, @Req() req: Request) {
    const correlationId = req.headers['correlation-id'] as string;

    this.processLog('UpdateDoctor', correlationId, 'Nhận được yêu cầu cập nhật bác sĩ');

    const result = await this.usersService.updateDoctor({ id, ...body, correlationId });

    if (!result.ok) {
      this.processLog('UpdateDoctor', correlationId, `Không thành công ${result.error}`, 'warn');

      throw new HttpException(result.error, result.status);
    }

    this.processLog('UpdateDoctor', correlationId, 'Thành công');

    const { ok, status, error, ...data } = result;

    return data;
  }
}
