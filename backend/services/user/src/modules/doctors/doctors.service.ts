import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource, In } from 'typeorm';
import { DoctorMetadata } from './entities/doctor-metadata.entity';
import { IsActive, User } from '../users/entities/user.entity';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class DoctorsService {
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(DoctorMetadata) private metadataRepository: Repository<DoctorMetadata>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) { }

  async getAll(data: any) {
    const { page = 1, limit = 10, search, specialtyId, isActive } = data;
    const skip = (page - 1) * limit;

    const qb = this.metadataRepository
      .createQueryBuilder('dm')
      .leftJoinAndSelect('dm.user', 'user')
      .leftJoinAndSelect('dm.specialty', 'specialty')
      .leftJoinAndSelect('dm.degree', 'degree')
      .where('user.roleId = :roleId', { roleId: 2 });

    if (search) {
      qb.andWhere(
        '(user.fullName LIKE :search OR user.email LIKE :search OR user.phone LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (specialtyId) {
      qb.andWhere('dm.specialtyId = :specialtyId', { specialtyId });
    }

    if (isActive != undefined && isActive != null && isActive != '') {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [doctors, total] = await qb.getManyAndCount();

    return {
      ok: true,
      status: 200,
      data: doctors.map(dm => ({
        id: dm.user.id,
        fullName: dm.user.fullName,
        phone: dm.user.phone,
        email: dm.user.email,
        gender: dm.user.gender,
        isActive: dm.user.isActive,
        dob: dm.user.dob ? dm.user.dob.toString() : '',
        address: dm.user.address || '',
        specialtyId: dm.specialtyId,
        specialtyName: dm.specialty?.name || '',
        degreeId: dm.degreeId,
        degreeName: dm.degree?.name || '',
        experienceYears: dm.experienceYears,
        biography: dm.biography || '',
        workType: dm.workType,
        createdAt: dm.user.createdAt.toISOString()
      })),
      total,
      page,
      limit
    };
  }

  async getById(data: any) {
    const dm = await this.metadataRepository.findOne({
      where: { userId: data.id },
      relations: {
        user: true,
        specialty: true,
        degree: true
      }
    });

    if (!dm) {
      return {
        ok: false,
        status: 404,
        error: 'Bác sĩ không tồn tại'
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        id: dm.user.id,
        fullName: dm.user.fullName,
        phone: dm.user.phone,
        email: dm.user.email,
        gender: dm.user.gender,
        isActive: dm.user.isActive,
        dob: dm.user.dob ? dm.user.dob.toString() : '',
        address: dm.user.address || '',
        specialtyId: dm.specialtyId,
        specialtyName: dm.specialty?.name || '',
        degreeId: dm.degreeId,
        degreeName: dm.degree?.name || '',
        experienceYears: dm.experienceYears,
        biography: dm.biography || '',
        workType: dm.workType,
        createdAt: dm.user.createdAt.toISOString()
      }
    };
  }

  async create(data: any) {
    const emailExists = await this.userRepository.exists({
      where: { email: data.email }
    });

    if (emailExists) {
      return {
        ok: false,
        status: 400,
        error: 'Email đã được sử dụng'
      };
    }

    const phoneExists = await this.userRepository.exists({
      where: { phone: data.phone }
    });

    if (phoneExists) {
      return {
        ok: false,
        status: 400,
        error: 'Số điện thoại đã được sử dụng'
      };
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS')!;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const newUser = this.userRepository.create({
        roleId: 2,
        phone: data.phone,
        password: hashedPassword,
        email: data.email,
        fullName: data.fullName,
        gender: data.gender,
        dob: data.dob || null,
        address: data.address || null
      });
      const savedUser = await queryRunner.manager.save(newUser);
      const metadata = this.metadataRepository.create({
        userId: savedUser.id,
        specialtyId: data.specialtyId,
        degreeId: data.degreeId,
        experienceYears: data.experienceYears || 0,
        biography: data.biography || null,
        workType: data.workType || 'BOTH'
      });

      await queryRunner.manager.save(metadata);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      throw e;
    } finally {
      await queryRunner.release();
    }

    return {
      ok: true,
      status: 201,
      message: 'Tạo bác sĩ thành công'
    };
  }

  async update(data: any) {
    const user = await this.userRepository.findOne({
      where: {
        id: data.id,
        roleId: 2
      }
    });

    if (!user) {
      return {
        ok: false,
        status: 404,
        error: 'Bác sĩ không tồn tại'
      };
    }

    const metadata = await this.metadataRepository.findOne({
      where: { userId: data.id }
    });

    if (!metadata) {
      return {
        ok: false,
        status: 404,
        error: 'Metadata bác sĩ không tồn tại'
      };
    }

    if (data.email && data.email != user.email) {
      const emailExists = await this.userRepository.findOne({
        where: {
          email: data.email,
          id: Not(data.id)
        }
      });

      if (emailExists) {
        return {
          ok: false,
          status: 400,
          error: 'Email đã được sử dụng'
        };
      }

      user.email = data.email;
    }

    if (data.phone && data.phone != user.phone) {
      const phoneExists = await this.userRepository.findOne({
        where: {
          phone: data.phone,
          id: Not(data.id)
        }
      });

      if (phoneExists) {
        return {
          ok: false,
          status: 400,
          error: 'Số điện thoại đã được sử dụng'
        };
      }

      user.phone = data.phone;
    }

    if (data.fullName) {
      user.fullName = data.fullName;
    }

    if (data.gender) {
      user.gender = data.gender;
    }

    if (data.dob != undefined) {
      user.dob = data.dob || null;
    }

    if (data.address != undefined) {
      user.address = data.address || null;
    }

    if (data.specialtyId) {
      metadata.specialtyId = data.specialtyId;
    }

    if (data.degreeId) {
      metadata.degreeId = data.degreeId;
    }

    if (data.experienceYears != undefined) {
      metadata.experienceYears = data.experienceYears;
    }

    if (data.biography != undefined) {
      metadata.biography = data.biography || null;
    }

    if (data.workType) {
      metadata.workType = data.workType;
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(user);

      await queryRunner.manager.save(metadata);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      throw e;
    } finally {
      await queryRunner.release();
    }

    await this.cacheManager.del(`RT_${user.id}`);

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật bác sĩ thành công'
    };
  }

  async getAllNamesBySpecialtyId(data: any) {
    const doctors = await this.userRepository.find({
      where: {
        roleId: 2,
        isActive: IsActive.ACTIVE,
        doctorMetadata: {
          specialtyId: data.id
        }
      },
      relations: { doctorMetadata: true }
    });

    return {
      ok: true,
      status: 200,
      data: doctors.map(d => ({
        id: d.id,
        fullName: d.fullName
      }))
    };
  }

  async getAllNamesByIds(data: any) {
    const doctors = await this.userRepository.find({
      where: {
        roleId: 2,
        isActive: IsActive.ACTIVE,
        id: In(data.ids)
      },
      relations: { doctorMetadata: true }
    });

    return {
      ok: true,
      status: 200,
      data: doctors.map(d => ({
        id: d.id,
        fullName: d.fullName
      }))
    };
  }
}
