import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "src/decorators/roles.decorator";

@Injectable()
export class AccessGuard implements CanActivate {
    private readonly roleMap: Record<string, number>;

    constructor(private reflector: Reflector, private readonly jwtService: JwtService) {
        this.roleMap = {
            'Admin': 1,
            'Doctor': 2,
            'Patient': 3,
            'Nurse': 4
        };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();

            if (!request.headers.authorization) {
                throw new UnauthorizedException('Token không được cung cấp');
            }

            const token = request.headers.authorization.split(' ')[1];
            const payload = await this.jwtService.verifyAsync(token);
            request.user = payload;

            const roles = this.reflector.get(Roles, context.getHandler());

            if (!roles || roles.length == 0) {
                return true;
            }

            const mappedRoles = roles.map((role: string) => this.roleMap[role]);

            if (!mappedRoles.includes(payload.roleId)) {
                throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
            }

            return true;
        } catch (e) {
            if (e instanceof ForbiddenException) {
                throw e;
            }

            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
    }
}