import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const customFormat = winston.format((info) => {
    info.timestamp = info.timestamp ?? new Date().toISOString();
    return info;
})
const fileTransport: DailyRotateFile = new DailyRotateFile({
    filename: 'logs/app-%DATE%.json',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxFiles: '30d',
    format: winston.format.combine(
        customFormat(),
        winston.format.json()
    )
});
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        customFormat(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
    )
});
const logger = winston.createLogger({
    transports: [
        fileTransport,
        consoleTransport
    ],
    exitOnError: false
});

export default logger;