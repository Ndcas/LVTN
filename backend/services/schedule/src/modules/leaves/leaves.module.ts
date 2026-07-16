import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { DoctorLeave } from './entities/doctor-leave.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([DoctorLeave]),
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
    controllers: [LeavesController],
    providers: [LeavesService]
})
export class LeavesModule { }
