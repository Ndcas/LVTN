import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Degree } from './entities/degree.entity';
import { Specialty } from './entities/specialty.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Degree) private degreeRepository: Repository<Degree>,
    @InjectRepository(Specialty) private specialtyRepository: Repository<Specialty>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'user_service',
      correlationId: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  async getAllRoles(data: any) {
    try {
      const cachedRoles = await this.cache.get('roles');

      if (cachedRoles) {
        return {
          ok: true,
          status: 200,
          data: cachedRoles
        };
      }
    } catch (error) {
      this.processLog('GetAllRoles', data.correlationId, `Lỗi khi lấy danh sách vai trò từ cache: ${error}`, 'warn');
    }

    const roles = await this.roleRepository.find({
      order: { id: 'ASC' }
    });
    const returnData = roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || ''
    }));

    this.cache.set('roles', returnData, 1800000).catch(e => {
      this.processLog('GetAllRoles', data.correlationId, `Lỗi khi lưu danh sách vai trò vào cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 200,
      data: returnData
    };
  }

  async getAllSpecialties(data: any) {
    try {
      const cachedSpecialties = await this.cache.get('specialties');

      if (cachedSpecialties) {
        return {
          ok: true,
          status: 200,
          data: cachedSpecialties
        };
      }
    } catch (error) {
      this.processLog('GetAllSpecialties', data.correlationId, `Lỗi khi lấy danh sách chuyên khoa từ cache: ${error}`, 'warn');
    }

    const specialties = await this.specialtyRepository.find({
      order: { name: 'ASC' }
    });
    const returnData = specialties.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      description: s.description || '',
      defaultFee: Number(s.defaultFee),
      createdAt: s.createdAt.toISOString()
    }));

    this.cache.set('specialties', returnData, 1800000).catch(e => {
      this.processLog('GetAllSpecialties', data.correlationId, `Lỗi khi lưu danh sách chuyên khoa vào cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 200,
      data: returnData
    };
  }

  async createSpecialty(data: any) {
    const exists = await this.specialtyRepository.findOne({
      where: [{ name: data.name }, { code: data.code }],
    });

    if (exists) {
      return {
        ok: false,
        status: 400,
        error: 'Tên hoặc mã chuyên khoa đã tồn tại'
      };
    }

    const specialty = this.specialtyRepository.create({
      name: data.name,
      code: data.code,
      description: data.description || null,
      defaultFee: data.defaultFee || 100000,
    });

    await this.specialtyRepository.save(specialty);

    this.cache.del('specialties').catch(e => {
      this.processLog('CreateSpecialty', data.correlationId, `Lỗi khi xóa danh sách chuyên khoa khỏi cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 201,
      message: 'Tạo chuyên khoa thành công'
    };
  }

  async updateSpecialty(data: any) {
    const specialty = await this.specialtyRepository.findOne({
      where: { id: data.id }
    });

    if (!specialty) {
      return {
        ok: false,
        status: 404,
        error: 'Chuyên khoa không tồn tại'
      };
    }

    if (data.name) {
      specialty.name = data.name;
    }

    if (data.code) {
      specialty.code = data.code;
    }

    if (data.description != undefined) {
      specialty.description = data.description || null;
    }

    if (data.defaultFee != undefined) {
      specialty.defaultFee = data.defaultFee;
    }

    await this.specialtyRepository.save(specialty);

    this.cache.del('specialties').catch(e => {
      this.processLog('UpdateSpecialty', data.correlationId, `Lỗi khi xóa danh sách chuyên khoa khỏi cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật chuyên khoa thành công'
    };
  }

  async getAllDegrees(data: any) {
    try {
      const cachedDegrees = await this.cache.get('degrees');

      if (cachedDegrees) {
        return {
          ok: true,
          status: 200,
          data: cachedDegrees
        };
      }
    } catch (error) {
      this.processLog('GetAllDegrees', data.correlationId, `Lỗi khi lấy danh sách bằng cấp từ cache: ${error}`, 'warn');
    }

    const degrees = await this.degreeRepository.find({
      order: { id: 'ASC' }
    });
    const returnData = degrees.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description || '',
      createdAt: d.createdAt.toISOString()
    }));

    this.cache.set('degrees', returnData, 1800000).catch(e => {
      this.processLog('GetAllDegrees', data.correlationId, `Lỗi khi lưu danh sách bằng cấp vào cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 200,
      data: returnData
    };
  }

  async createDegree(data: any) {
    const exists = await this.degreeRepository.findOne({
      where: { name: data.name }
    });

    if (exists) {
      return {
        ok: false,
        status: 400,
        error: 'Tên bằng cấp đã tồn tại'
      };
    }

    const degree = this.degreeRepository.create({
      name: data.name,
      description: data.description || null
    });

    await this.degreeRepository.save(degree);

    this.cache.del('degrees').catch(e => {
      this.processLog('CreateDegree', data.correlationId, `Lỗi khi xóa danh sách bằng cấp khỏi cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 201,
      message: 'Tạo bằng cấp thành công'
    };
  }

  async updateDegree(data: any) {
    const degree = await this.degreeRepository.findOne({
      where: { id: data.id }
    });

    if (!degree) {
      return {
        ok: false,
        status: 404,
        error: 'Bằng cấp không tồn tại'
      };
    }

    if (data.name) {
      degree.name = data.name;
    }

    if (data.description != undefined) {
      degree.description = data.description || null;
    }

    await this.degreeRepository.save(degree);

    this.cache.del('degrees').catch(e => {
      this.processLog('UpdateDegree', data.correlationId, `Lỗi khi xóa danh sách bằng cấp khỏi cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật bằng cấp thành công'
    };
  }
}
