import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { Role } from './entities/role.entity';
import { Degree } from './entities/degree.entity';
import { Specialty } from './entities/specialty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Degree, Specialty])],
  providers: [CatalogsService],
  controllers: [CatalogsController]
})
export class CatalogsModule {}
