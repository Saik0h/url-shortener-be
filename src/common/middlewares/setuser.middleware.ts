import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class SetUserMiddleware implements NestMiddleware {
  constructor(@Inject() private readonly authService: AuthService) {}

  use(req: any, res: any, next: () => void) {
    const permission = this.authService.getTokens(req);
    if (!permission) {
      req['user'] = { id: 'c97f568c-bce0-4c4a-a7ff-335a2e99335a', email: 'anon@anon.com' };
      return next();
    }
    
    const user = this.authService.identify(req);
    req['user'] = user;
    next();
  }
}
