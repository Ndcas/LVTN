import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface UserServiceClient {
  register(data: any): Observable<any>;
  login(data: any): Observable<any>;
  refresh(data: any): Observable<any>;
  logout(data: any): Observable<any>;
  forgotPassword(data: any): Observable<any>;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@Inject('USER_PACKAGE') private client: ClientGrpc) { }

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
  }

  register(data: any) {
    return lastValueFrom(this.userService.register(data));
  }

  login(data: any) {
    return lastValueFrom(this.userService.login(data));
  }

  refresh(data: any) {
    return lastValueFrom(this.userService.refresh(data));
  }

  logout(data: any) {
    return lastValueFrom(this.userService.logout(data));
  }
}
