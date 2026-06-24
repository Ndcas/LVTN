import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, Transporter } from "nodemailer";

@Injectable()
export class MailService {
    private readonly transporter: Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, html?: string) {
        try {
            await this.transporter.sendMail({
                from: '"Hệ thống Quản lý Phòng khám" <' + this.configService.get<string>('SMTP_USER') + '>',
                to: to,
                subject: subject,
                text: text,
                html: html,
            });
        } catch (e) {
            throw new Error(`Lỗi khi gửi mail ${e}`);
        }
    }
}