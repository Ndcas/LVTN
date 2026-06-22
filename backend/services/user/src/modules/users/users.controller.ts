import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('LOG_SERVICE') private logClient: ClientProxy
  ) { }

  private processLog(action: string, phase: string, correlationId: string) {
    this.logClient.emit('system_log', {
      level: 'info',
      message: `[${phase}] ${action}`,
      service: 'user_service',
      correlationID: correlationId || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  @GrpcMethod('UserService', 'Register')
  async register(data: any) {
    this.processLog('Register', 'Start', data.correlationId);
    const result = await this.usersService.register(data);
    this.processLog('Register', 'End', data.correlationId);
    return result;
  }

  @GrpcMethod('UserService', 'Login')
  async login(data: any) {
    this.processLog('Login', 'Start', data.correlationId);
    const result = await this.usersService.login(data);
    this.processLog('Login', 'End', data.correlationId);
    return result;
  }

  @GrpcMethod('UserService', 'Refresh')
  async refresh(data: any) {
    this.processLog('Refresh', 'Start', data.correlationId);
    const result = await this.usersService.refresh(data);
    this.processLog('Refresh', 'End', data.correlationId);
    return result;
  }

  @GrpcMethod('UserService', 'Logout')
  async logout(data: any) {
    this.processLog('Logout', 'Start', data.correlationId);
    const result = await this.usersService.logout(data);
    this.processLog('Logout', 'End', data.correlationId);
    return result;
  }

  @GrpcMethod('UserService', 'ForgotPassword')
  async forgotPassword(data: any) {
    this.processLog('ForgotPassword', 'Start', data.correlationId);
    const result = await this.usersService.forgotPassword(data);
    this.processLog('ForgotPassword', 'End', data.correlationId);
    return result;
  }
}
