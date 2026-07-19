import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { IsActive, Medicine } from './entities/medicine.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine) private medicineRepository: Repository<Medicine>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async getAll(data: any) {
    const { keyword, isActive } = data;

    if (!keyword && isActive == IsActive.ACTIVE) {
      const cachedMedicines = await this.cacheManager.get('medicines:active');

      if (cachedMedicines) {
        return {
          ok: true,
          status: 200,
          data: cachedMedicines
        };
      }
    }

    const queryBuilder = this.medicineRepository.createQueryBuilder('medicine');

    if (keyword) {
      queryBuilder.andWhere('medicine.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (isActive) {
      queryBuilder.andWhere('medicine.isActive = :isActive', { isActive });
    }

    const medicines = await queryBuilder.getMany();
    const resultData = medicines.map(medicine => ({
      ...medicine,
      createdAt: medicine.createdAt.toISOString(),
      updatedAt: medicine.updatedAt.toISOString()
    }));

    if (!keyword && isActive == IsActive.ACTIVE) {
      await this.cacheManager.set('medicines:active', resultData, 1800000);
    }

    return {
      ok: true,
      status: 200,
      data: resultData
    };
  }

  async getById(data: any) {
    const medicine = await this.medicineRepository.findOne({
      where: { id: data.id }
    });

    if (!medicine) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy thuốc'
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        ...medicine,
        createdAt: medicine.createdAt.toISOString(),
        updatedAt: medicine.updatedAt.toISOString()
      }
    };
  }

  async create(data: any) {
    const existingMedicine = await this.medicineRepository.exists({
      where: { name: data.name }
    });

    if (existingMedicine) {
      return {
        ok: false,
        status: 400,
        error: 'Tên thuốc đã tồn tại'
      };
    }

    const medicine = this.medicineRepository.create(data);

    await this.medicineRepository.save(medicine);

    await this.cacheManager.del('medicines:active');

    return {
      ok: true,
      status: 200,
      message: 'Thêm thuốc thành công'
    };
  }

  async update(data: any) {
    const { id, name, unit, pricePerUnit } = data;

    const medicine = await this.medicineRepository.findOne({
      where: { id }
    });

    if (!medicine) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy thuốc'
      };
    }

    if (name && name != medicine.name) {
      const existingMedicine = await this.medicineRepository.exists({
        where: {
          name,
          id: Not(id)
        }
      });

      if (existingMedicine) {
        return {
          ok: false,
          status: 400,
          error: 'Tên thuốc đã tồn tại'
        };
      }

      medicine.name = name;
    }

    if (unit) {
      medicine.unit = unit;
    }

    if (pricePerUnit) {
      medicine.pricePerUnit = pricePerUnit;
    }

    await this.medicineRepository.save(medicine);

    await this.cacheManager.del('medicines:active');

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật thuốc thành công'
    };
  }

  async toggleActive(data: any) {
    const medicine = await this.medicineRepository.findOne({
      where: { id: data.id }
    });

    if (!medicine) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy thuốc'
      };
    }

    medicine.isActive = medicine.isActive == IsActive.ACTIVE ? IsActive.INACTIVE : IsActive.ACTIVE;

    await this.medicineRepository.save(medicine);

    await this.cacheManager.del('medicines:active');

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật trạng thái thuốc thành công'
    };
  }
}
