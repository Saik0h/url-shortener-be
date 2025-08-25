import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DecodedJWT } from './types';

export const AuthUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user as DecodedJWT;

    return data ? user?.[data] : user as DecodedJWT;
  },
);