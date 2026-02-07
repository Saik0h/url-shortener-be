import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from './types';

export const AuthUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user as RequestUser;
    return data ? user?.[data] : (user as RequestUser);
  },
);
