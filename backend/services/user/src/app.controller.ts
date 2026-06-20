import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @GrpcMethod('UserService', 'Ping')
  ping(data: any, metadata: any, call: any): any {
    return { message: 'Pong from User Service!' };
  }
}
