import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { DecodedJWT } from '../types';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@Inject() private readonly authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const user = this.authService.identify(req);
    if (!user) return false;
    req['user'] = user as DecodedJWT;
    return true;
  }
}
