import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { DoctorWeeklyTemplate } from './entities/doctor-weekly-template.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([DoctorWeeklyTemplate]),
        ClientsModule.register([{
            name: 'LOG_SERVICE',
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RMQ_URL!],
                queue: 'log',
                queueOptions: { durable: true }
            }
        }])
    ],
    controllers: [TemplatesController],
    providers: [TemplatesService]
})
export class TemplatesModule { }
