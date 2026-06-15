import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(correlationId: string): string {
    return `Hello World! Correlation ID = ${correlationId}`;
  }
}
