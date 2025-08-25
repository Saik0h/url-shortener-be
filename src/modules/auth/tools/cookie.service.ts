import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class CookieService {
  setCookie(res: Response, name: string, value: string, options?: any) {
    res.cookie(name, value, {
      httpOnly: true, // impede JS do frontend de ler o cookie
      secure: true, // ⚠️ se você estiver em HTTP local, use false
      sameSite: 'lax', // ou 'none' se estiver em cross-site (precisa de secure: true)
      ...options,
    });
  }

  getCookie(req: Request, name: string) {
    return req.cookies[name];
  }

  clearCookie(res: Response, name: string) {
    res.clearCookie(name);
  }
}
