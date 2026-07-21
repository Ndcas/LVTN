import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Disease } from './entities/disease.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class DiseasesService {
  constructor(
    @InjectRepository(Disease) private diseaseRepository: Repository<Disease>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async getAll(data: any) {
    const { keyword } = data;

    if (!keyword) {
      const cachedDiseases = await this.cacheManager.get('diseases');

      if (cachedDiseases) {
        return {
          ok: true,
          status: 200,
          data: cachedDiseases
        };
      }
    }

    const queryBuilder = this.diseaseRepository.createQueryBuilder('disease');

    if (keyword) {
      queryBuilder.where('disease.name LIKE :keyword OR disease.disease_code LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const diseases = await queryBuilder.getMany();
    const resultData = diseases.map(disease => ({
      ...disease,
      createdAt: disease.createdAt.toISOString()
    }));

    if (!keyword) {
      await this.cacheManager.set('diseases', resultData, 1800000);
    }

    return {
      ok: true,
      status: 200,
      data: resultData
    };
  }

  async getById(data: any) {
    const disease = await this.diseaseRepository.findOne({
      where: { id: data.id }
    });

    if (!disease) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy bệnh lý'
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        ...disease,
        createdAt: disease.createdAt.toISOString()
      }
    };
  }

  async create(data: any) {
    const existingDisease = await this.diseaseRepository.exists({
      where: { diseaseCode: data.diseaseCode }
    });

    if (existingDisease) {
      return {
        ok: false,
        status: 400,
        error: 'Mã bệnh lý đã tồn tại'
      };
    }

    const disease = this.diseaseRepository.create(data);

    await this.diseaseRepository.save(disease);

    await this.cacheManager.del('diseases');

    return {
      ok: true,
      status: 200,
      message: 'Thêm bệnh lý thành công'
    };
  }

  async update(data: any) {
    const { id, diseaseCode, name, description } = data;

    const disease = await this.diseaseRepository.findOne({
      where: { id: id }
    });

    if (!disease) {
      return {
        ok: false,
        status: 404,
        error: 'Không tìm thấy bệnh lý'
      };
    }

    if (diseaseCode && diseaseCode != disease.diseaseCode) {
      const existingDisease = await this.diseaseRepository.exists({
        where: {
          id: Not(id),
          diseaseCode
        }
      });

      if (existingDisease) {
        return {
          ok: false,
          status: 400,
          error: 'Mã bệnh lý đã tồn tại'
        };
      }

      disease.diseaseCode = diseaseCode;
    }

    if (name) {
      disease.name = name;
    }
    if (description) {
      disease.description = description;
    }

    await this.diseaseRepository.save(disease);

    await this.cacheManager.del('diseases');

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật bệnh lý thành công'
    };
  }
}
