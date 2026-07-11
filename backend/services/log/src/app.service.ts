import { Injectable } from '@nestjs/common';
import logger from './logger';

@Injectable()
export class AppService {

  handleSystemLog(data: any) {
    const { level = 'info', message, service, timestamp, ...meta } = data;

    logger.log({
      level: level,
      message: message,
      service: service || 'unknown_service',
      timestamp: timestamp,
      ...meta,
    });
  }
}
