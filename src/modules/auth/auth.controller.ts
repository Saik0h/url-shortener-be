import { Controller, Post, Body, Res, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AuthUser } from '../../common/AuthUser.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DecodedJWT } from '../../common/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(JwtGuard)
  getUser(@AuthUser() user: DecodedJWT) {
    return this.authService.getCurrent(user.id);
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto, @Res({passthrough: true}) res: Response) {
    return this.authService.registerUser(res, body);
  }

  @Post('login')
  login(@Body() body: LoginDto, @Res({passthrough: true}) res: Response) {
    return this.authService.login(body, res);
  }

  @Post('logout')
  logout(@Res({passthrough: true}) res: Response) {
    return this.authService.logout(res);
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    return this.authService.refresh(req, res);
  }
}
