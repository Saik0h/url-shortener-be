import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { RequestUser } from '../types';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    try {
      const user = this.authService.identify(req);
      req['user'] = user as RequestUser;
    } catch {
      req['user'] = { isAuthenticated: false } as RequestUser;
      return false
    }

    return true;
  }
}
