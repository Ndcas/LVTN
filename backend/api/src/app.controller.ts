import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface UserService {
  ping(data: any): Observable<any>;
}

@Controller()
export class AppController implements OnModuleInit {
  private userService: UserService;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  @Get('ping-user')
  pingUser() {
    return this.userService.ping({});
  }
}
