// // File này dùng để test
// import { Controller, Get, Inject, OnModuleInit, Req } from '@nestjs/common';
// import type { ClientGrpc, ClientProxy } from '@nestjs/microservices';
// import { Observable } from 'rxjs';
// import * as crypto from 'crypto';

// interface UserService {
//   ping(data: any): Observable<any>;
// }

// @Controller()
// export class AppController implements OnModuleInit {
//   private userService: UserService;
//   private readonly loggerClient: ClientProxy;

//   constructor(
//     @Inject('USER_PACKAGE') private readonly client: ClientGrpc,
//     @Inject('LOG_SERVICE') private readonly logClient: ClientProxy,
//   ) { }

//   onModuleInit() {
//     this.userService = this.client.getService<UserService>('UserService');
//   }

//   @Get('test-log')
//   testLog(@Req() req: Request) {
//     let current = new Date();
//     console.log('Current Date: ', current.toISOString());
//     current.setDate(current.getDate() + 1)
//     console.log('Date after adding 1 day: ', current.toISOString());
//     // Gửi log
//     this.logClient.emit('system_log', {
//       level: 'info',
//       message: 'Test log from api_gateway',
//       service: 'api_gateway',
//       correlationID: req.headers['correlation-id'] || crypto.randomUUID(),
//       timestamp: current.toISOString(),
//     });
//   }

//   @Get('ping-user')
//   pingUser() {
//     return this.userService.ping({});
//   }
// }
