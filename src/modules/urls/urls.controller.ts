import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Req,
  Res,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Request, Response } from 'express';
import { AuthUser } from '../../common/AuthUser.decorator';
import { RequestUser } from '../../common/types';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { JwtGuard } from '../../common/guards/jwt.guard';

@SkipThrottle()
@Controller('u')
export class UrlsController {
  constructor(@Inject() private readonly urlsService: UrlsService) {}

  @SkipThrottle({ default: false })
  @Throttle({ default: { limit: 4, ttl: 2000 } })
  @Post()
  shortenUrl(
    @Body() dto: CreateUrlDto,
    @Req() req: Request,
    @AuthUser() user: RequestUser,
  ) {
    return this.urlsService.shorten(dto, req, user);
  }

  @Get('user')
  getAllFromUser(@AuthUser() user: RequestUser) {
    return this.urlsService.getAllFromUser(user.sub);
  }

  @Get(':id')
  redirecTo(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.urlsService.redirect(id, res);
  }

  @Delete(':id')
  deleteURL(@Param('id') id: string, @AuthUser('sub') userId: string | undefined) {
    console.log(userId)
    return this.urlsService.delete(id, userId);
  }
}
