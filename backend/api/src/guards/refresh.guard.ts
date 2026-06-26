import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RefreshGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();

            if (!request.body.refreshToken) {
                throw new UnauthorizedException('Refresh token không được cung cấp');
            }

            const token = request.body.refreshToken;
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') });
            request.user = payload;

            return true;
        } catch (e) {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }
}