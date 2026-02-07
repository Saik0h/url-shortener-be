import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthUser } from '../../common/AuthUser.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RequestUser } from '../../common/types';
import { ChangePasswordDto } from './dto/change-password.dto';

@SkipThrottle()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('current')
  @UseGuards(JwtGuard)
  getUser(@AuthUser('sub') userID: string | undefined) {
    return this.usersService.getProfile(userID);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.usersService.getOne(id);
  }

  @Patch('name')
  update(
    @AuthUser('sub') userId: string | undefined,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('password')
  changePassword(
    @AuthUser('sub') userID: string | undefined,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userID, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
