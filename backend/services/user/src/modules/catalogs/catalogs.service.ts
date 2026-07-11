import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Degree } from './entities/degree.entity';
import { Specialty } from './entities/specialty.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Degree) private readonly degreeRepository: Repository<Degree>,
    @InjectRepository(Specialty) private readonly specialtyRepository: Repository<Specialty>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) { }

  async getAllRoles() {
    const cachedRoles = await this.cache.get('roles');

    if (cachedRoles) {
      return {
        ok: true,
        status: 200,
        data: cachedRoles
      };
    }

    const roles = await this.roleRepository.find({
      order: { id: 'ASC' }
    });

    const data = roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || ''
    }));

    await this.cache.set('roles', data, 1800000);

    return {
      ok: true,
      status: 200,
      data
    };
  }

  async getAllSpecialties() {
    const cachedSpecialties = await this.cache.get('specialties');

    if (cachedSpecialties) {
      return {
        ok: true,
        status: 200,
        data: cachedSpecialties
      };
    }

    const specialties = await this.specialtyRepository.find({
      order: { name: 'ASC' }
    });

    const data = specialties.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      description: s.description || '',
      defaultFee: Number(s.defaultFee),
      createdAt: s.createdAt.toISOString()
    }));

    await this.cache.set('specialties', data, 1800000);

    return {
      ok: true,
      status: 200,
      data
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

    await this.cache.del('specialties');

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

    await this.cache.del('specialties');

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật chuyên khoa thành công'
    };
  }

  async getAllDegrees() {
    const cachedDegrees = await this.cache.get('degrees');

    if (cachedDegrees) {
      return {
        ok: true,
        status: 200,
        data: cachedDegrees
      };
    }

    const degrees = await this.degreeRepository.find({
      order: { id: 'ASC' }
    });

    const data = degrees.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description || '',
      createdAt: d.createdAt.toISOString()
    }));

    await this.cache.set('degrees', data, 1800000);

    return {
      ok: true,
      status: 200,
      data
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

    await this.cache.del('degrees');

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

    await this.cache.del('degrees');

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật bằng cấp thành công'
    };
  }
}
