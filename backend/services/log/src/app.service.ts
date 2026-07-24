import { Injectable } from '@nestjs/common';
import logger from './logger';
import { join } from 'node:path';
import zlib from 'zlib';
import { promisify } from 'util';
import { readdir, readFile } from 'node:fs/promises';

@Injectable()
export class AppService {
  private gunzip;
  private levelMap: Map<string, number>;

  constructor() {
    this.gunzip = promisify(zlib.gunzip);
    this.levelMap = new Map<string, number>([
      ['info', 1],
      ['warn', 2],
      ['error', 3],
    ]);
  }

  async getLogs(data: any) {
    const { keyword, minLevel, date, traceId } = data;

    const logDir = join(process.cwd(), 'logs');
    let targetDate = date;

    if (!targetDate) {
      const files = await readdir(logDir);
      const logFiles = files.filter(f => f.startsWith('app-') && (f.endsWith('.json') || f.endsWith('.json.gz')));

      if (logFiles.length === 0) {
        return {
          ok: true,
          status: 200,
          logs: []
        };
      }

      logFiles.sort((a, b) => b.localeCompare(a));

      targetDate = logFiles[0].replace('app-', '').replace('.json.gz', '').replace('.json', '');
    }

    const logFilePath = join(logDir, `app-${targetDate}.json`);
    let fileContent = '';

    try {
      fileContent = await readFile(logFilePath, 'utf-8');
    } catch (e) {
      try {
        const zippedContent = await readFile(logFilePath + '.gz');
        fileContent = (await this.gunzip(zippedContent)).toString('utf-8');
      } catch (e2) {
        return {
          ok: true,
          status: 200,
          logs: []
        };
      }
    }

    const filterMinLevelValue = this.levelMap.get(minLevel) || 0;
    const logs = fileContent.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        try {
          const log = JSON.parse(line);

          if ((this.levelMap.get(log.level) || 0) < filterMinLevelValue) {
            return null;
          }

          if (traceId && log.correlationId != traceId) {
            return null;
          }

          if (keyword && log.message && !log.message.toLowerCase().includes(keyword.toLowerCase())) {
            return null;
          }

          return log;
        } catch (e) {
          return null;
        }
      })
      .filter(log => log !== null);

    return {
      ok: true,
      status: 200,
      data: logs
    };
  }

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
