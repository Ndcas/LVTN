import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Disease } from './entities/disease.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DiseasesService {
  constructor(
    @InjectRepository(Disease) private diseaseRepository: Repository<Disease>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, correlationId: string, info: string, level: string = 'info') {
    this.logClient.emit('system_log', {
      level: level,
      message: `${action} ${info}`,
      service: 'medicalrecord_service',
      correlationId: correlationId,
      timestamp: new Date().toISOString()
    });
  }

  async getAll(data: any) {
    const { keyword } = data;

    if (!keyword) {
      try {
        const cachedDiseases = await this.cacheManager.get('diseases');

        if (cachedDiseases) {
          return {
            ok: true,
            status: 200,
            data: cachedDiseases
          };
        }
      } catch (error) {
        this.processLog('GetAllDiseases', data.correlationId, `Lỗi khi lấy danh sách bệnh lý từ cache: ${error}`, 'warn');
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
      this.cacheManager.set('diseases', resultData, 1800000).catch(e => {
        this.processLog('GetAllDiseases', data.correlationId, `Lỗi khi lưu danh sách bệnh lý vào cache: ${e}`, 'warn');
      });
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

    this.cacheManager.del('diseases').catch(e => {
      this.processLog('CreateDisease', data.correlationId, `Lỗi khi xóa danh sách bệnh lý khỏi cache: ${e}`, 'warn');
    });

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

    this.cacheManager.del('diseases').catch(e => {
      this.processLog('UpdateDisease', data.correlationId, `Lỗi khi xóa danh sách bệnh lý khỏi cache: ${e}`, 'warn');
    });

    return {
      ok: true,
      status: 200,
      message: 'Cập nhật bệnh lý thành công'
    };
  }
}
