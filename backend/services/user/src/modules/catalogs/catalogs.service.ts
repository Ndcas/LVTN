import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Degree } from './entities/degree.entity';
import { Specialty } from './entities/specialty.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Degree) private readonly degreeRepository: Repository<Degree>,
    @InjectRepository(Specialty) private readonly specialtyRepository: Repository<Specialty>
  ) { }

  async getAllRoles(): Promise<any> {
    const roles = await this.roleRepository.find({
      order: { id: 'ASC' }
    });

    return {
      ok: true,
      status: 200,
      data: roles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description || ''
      }))
    };
  }

  async getAllSpecialties(): Promise<any> {
    const specialties = await this.specialtyRepository.find({
      order: { name: 'ASC' }
    });

    return {
      ok: true,
      status: 200,
      data: specialties.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        description: s.description || '',
        defaultFee: Number(s.defaultFee),
        createdAt: s.createdAt.toISOString()
      }))
    };
  }

  async createSpecialty(data: any): Promise<any> {
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

    return {
      ok: true,
      status: 201,
      message: 'Tạo chuyên khoa thành công'
    };
  }

  async updateSpecialty(data: any): Promise<any> {
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

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật chuyên khoa thành công'
    };
  }

  async getAllDegrees(): Promise<any> {
    const degrees = await this.degreeRepository.find({
      order: { id: 'ASC' }
    });

    return {
      ok: true,
      status: 200,
      data: degrees.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description || '',
        createdAt: d.createdAt.toISOString()
      }))
    };
  }

  async createDegree(data: any): Promise<any> {
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

    return {
      ok: true,
      status: 201,
      message: 'Tạo bằng cấp thành công'
    };
  }

  async updateDegree(data: any): Promise<any> {
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

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật bằng cấp thành công'
    };
  }
}
