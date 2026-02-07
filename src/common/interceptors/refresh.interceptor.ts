import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { Request, Response } from 'express';

@Injectable()
export class RefreshInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    return next.handle().pipe(
      catchError(async (error) => {
        if (
          error instanceof UnauthorizedException &&
          req.url !== '/auth/refresh'
        ) {
          try {
            await this.authService.refresh(req, res);
            return next.handle();
          } catch {
            throw new UnauthorizedException('Session expired');
          }
        }
        console.log("De alguma forma, passou aqui no refresh interceptor")
        throw error;
      }),
    );
  }
}
