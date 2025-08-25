import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { CookieService } from './tools/cookie.service';
import { HashService } from './tools/hash.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User';

@Module({
  imports: [
    JwtModule.register({
      secret: 'minha_chave_secreta',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [ AuthService, CookieService, HashService],
  exports: [AuthService, CookieService]
})
export class AuthModule {}
