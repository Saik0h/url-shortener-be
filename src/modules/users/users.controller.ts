import { Controller, Body, Patch, Param, Delete, Get, ClassSerializerInterceptor, UseInterceptors, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthUser } from '../../common/AuthUser.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DecodedJWT } from '../../common/types';

@Controller('users')
@SkipThrottle()
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('current')
  @UseGuards(JwtGuard)
  getUser(@AuthUser() user: DecodedJWT) {
    return this.usersService.getProfile(user.id);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.usersService.getOne(id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
