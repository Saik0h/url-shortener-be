import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';
import { Request } from 'express';
@Injectable()
export class SetUserMiddleware implements NestMiddleware {
  constructor(@Inject() private readonly authService: AuthService) { }

  use(req: Request, res: any, next: () => void) {
    const permission = this.authService.getTokens(req);

    if (req.baseUrl === "/auth/register") {
      return next()
    }

    if (!permission) {
      req['user'] = { id: 'c97f568c-bce0-4c4a-a7ff-335a2e99335a', email: 'anon@anon.com' };
      return next();
    }
    console.log("permission given")

    const user = this.authService.identify(req);
    req['user'] = user;
    next();
  }
}
