import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User';
import { ToolsModule } from './tools/tools.module';
import { UsersModule } from '../users/users.module';
import { RefreshInterceptor } from '../../common/interceptors/refresh.interceptor';

@Module({
  imports: [
    ToolsModule,
    UsersModule,
    JwtModule.register({
      secret: 'Imagine a very big and long string here',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, RefreshInterceptor],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
