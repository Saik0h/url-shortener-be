import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';
import { Request, Response } from 'express';
@Injectable()
export class SetUserMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: () => void) {
    if (req.baseUrl.startsWith('/auth')) {
      req['user'] = { isAuthenticated: false };
      return next();
    }

    const { access_token } = this.authService.getTokens(req);

    if (!access_token) {
      req['user'] = { isAuthenticated: false };
      return next();
    }

    try {
      const user = this.authService.identify(req);

      req['user'] = {
        isAuthenticated: true,
        id: user.sub,
      };
    } catch {
      req['user'] = { isAuthenticated: false };
    }

    next();
  }
}
