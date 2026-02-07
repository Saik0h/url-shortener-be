import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  UseGuards,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlsModule } from './modules/urls/urls.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './typeorm/entity/Url';
import { User } from './typeorm/entity/User';
import { Access } from './typeorm/entity/Access';
import { configs } from './config.service';
import { SetUserMiddleware } from './common/middlewares/set-user.middleware';
import { RegisterAccessMiddleware } from './common/middlewares/register-access.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './modules/auth/auth.service';
import { MailModule } from './modules/mail/mail.module';
import { Verification } from './typeorm/entity/Verification';
import { RefreshInterceptor } from './common/interceptors/refresh.interceptor';
import { JwtGuard } from './common/guards/jwt.guard';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    UrlsModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: configs.getDbHost(),
      port: configs.getDbPort(),
      username: configs.getDbUser(),
      password: configs.getDbPassword(),
      database: configs.getDbName(),
      synchronize: true,
      logging: false,
      entities: [Verification, Url, User, Access],
      migrations: ['src/typeorm/migration/*.ts'],
      subscribers: [],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 2000,
          limit: 1,
        },
      ],
    }),
    CacheModule.register({
      ttl: 60 * 120,
      isGlobal: true,
    }),
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    { provide: APP_INTERCEPTOR, useClass: RefreshInterceptor },
    { provide: APP_GUARD, useClass: JwtGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetUserMiddleware).forRoutes('*');
    consumer
      .apply(RegisterAccessMiddleware)
      .forRoutes({ path: '/u/:id', method: RequestMethod.GET });
  }
}
