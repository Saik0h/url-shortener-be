import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CookieService } from '../auth/tools/cookie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User'
import { AuthService } from '../../../dist/modules/auth/auth.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService, CookieService, AuthService],
})
export class UsersModule {}
