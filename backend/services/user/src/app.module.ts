import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      stores: [new KeyvRedis(process.env.REDIS_URL!)],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET!,
      signOptions: { expiresIn: '10m' },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true
    }),
    UsersModule,
    DoctorsModule,
    CatalogsModule
  ]
})
export class AppModule { }
