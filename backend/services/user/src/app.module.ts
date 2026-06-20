import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { FcmTokensModule } from './modules/fcm-tokens/fcm-tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    DoctorsModule,
    CatalogsModule,
    FcmTokensModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
