import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  SendVerificationPayload,
} from './dto/verification.dto';
import { VerificationService } from './verification.service';
import { AuthUser } from '../../common/AuthUser.decorator';
import { RequestUser } from '../../common/types';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('send')
  send(@AuthUser() user: RequestUser, @Body() dto: SendVerificationPayload) {
    return this.verificationService.send({...dto, id: user.sub});
  }

  @Get('verify/:type')
  async verify(
    @Param('type') type: 'email-confirmation' | '2fa',
    @Query('code') code: string,
  ) {
    return this.verificationService.verifyCode(type, code);
  }
}
