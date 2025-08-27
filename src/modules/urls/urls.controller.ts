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
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { Request, Response } from 'express';
import { AuthUser } from '../../common/AuthUser.decorator';
import { DecodedJWT } from '../../common/types';

@Controller('u')
export class UrlsController {
  constructor(@Inject() private readonly urlsService: UrlsService) {}

  @Post()
  shortenUrl(
    @Body() dto: CreateUrlDto,
    @Req() req: Request,
    @AuthUser() user: DecodedJWT,
  ) {
    return this.urlsService.shorten(dto, req, user);
  }

  @Get('user')
  getAllFromUser(@AuthUser() user: DecodedJWT) {
    return this.urlsService.getAllFromUser(user.id);
  }

  @Get(':id')
  redirecTo(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.urlsService.redirect(id, res);
  }

  @Delete(':id')
  deleteURL(@Param('id') id: string, @AuthUser() user: DecodedJWT) {
    return this.urlsService.delete(id, user);
  }
}
