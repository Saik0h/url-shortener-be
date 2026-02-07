import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthUser } from '../../common/AuthUser.decorator';
import { RequestUser } from '../../common/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() body: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.registerUser(res, body);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(body, res);
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true }) res: Response,
    @AuthUser('sub') userID: string | undefined,
  ) {
    return this.authService.logout(res, userID);
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('passou aqui')
    return this.authService.refresh(req, res);
  }
}
