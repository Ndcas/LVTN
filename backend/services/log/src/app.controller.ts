import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @EventPattern('system_log')
  handleSystemLog(@Payload() data: any) {

    this.appService.handleSystemLog(data);
  }
}
