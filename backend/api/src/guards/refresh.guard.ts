import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RefreshGuard implements CanActivate {
    constructor(private jwtService: JwtService, private configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const clientType = request.headers['client-type'];
            let token = null;

            if (clientType == 'web') {
                token = request.signedCookies['refreshToken'];
            } else if (clientType == 'mobile') {
                token = request.body.refreshToken;
            } else {
                throw new UnauthorizedException('Client type không hợp lệ');
            }

            if (!token) {
                throw new UnauthorizedException('Refresh token không được cung cấp');
            }

            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') });
            request.user = payload;
            request.body = {
                ...request.body,
                refreshToken: token
            };

            return true;
        } catch (e) {
            if (e instanceof UnauthorizedException) {
                throw e;
            }

            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }
}