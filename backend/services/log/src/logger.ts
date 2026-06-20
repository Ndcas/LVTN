import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transport: DailyRotateFile = new DailyRotateFile({
    filename: 'app-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxFiles: '30d'
});
const logger = winston.createLogger({
    transports: [transport]
});
logger.exitOnError = false;

export default logger;