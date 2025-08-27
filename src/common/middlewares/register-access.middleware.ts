import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { UrlsService } from '../../modules/urls/urls.service';
import { Request } from 'express';

@Injectable()
export class RegisterAccessMiddleware implements NestMiddleware {
  constructor(@Inject() private readonly url: UrlsService) { }
  use(req: Request, res: any, next: () => void) {
    const ip = req['ip'];
    const urlId = req.params['id'];

    const log = `User with ip: ${ip} accessed route: ${req.path}`;
    if (urlId === 'user') return
    this.url.registerAccess(urlId, ip);

    console.log(log);
    next();
  }
}
