import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

const baseCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 5 * 60 * 1000, // 5min
  path: '/',
};

@Injectable()
export class CookieService {
  setCookie(res: Response, name: string, value: string, options?: any) {
    res.cookie(name, value, {
      ...baseCookieOptions,
      ...options,
    });
  }

  getCookie(req: Request, name: string) {
    return req.cookies[name];
  }

  clearCookie(res: Response, name: string) {
    return res.clearCookie(name, baseCookieOptions);
  }
}
