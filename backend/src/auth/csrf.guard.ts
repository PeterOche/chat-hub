import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyCsrfToken } from './csrf.util';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const method = (req.method || 'GET').toUpperCase();
    const stateChanging = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    if (!stateChanging) return true;

    // Require auth user for manager routes (JwtAuthGuard should run before)
    const userId: string | undefined = req.user?.userId || req.user?.sub;
    if (!userId) return true; // if no user, leave to the auth guard/route to decide

    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies?.csrf;
    if (!headerToken || typeof headerToken !== 'string' || !cookieToken) {
      throw new ForbiddenException('Missing CSRF token');
    }
    const secret = this.config.get<string>('JWT_SECRET') || 'dev-secret';
    if (!verifyCsrfToken(secret, headerToken, userId)) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
