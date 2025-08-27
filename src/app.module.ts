import { MiddlewareConsumer, Module, RequestMethod, UseGuards } from '@nestjs/common';
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
import { SetUserMiddleware } from './common/middlewares/setuser.middleware';
import { RegisterAccessMiddleware } from './common/middlewares/register-access.middleware';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './modules/auth/auth.service';

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
      entities: [Url, User, Access],
      migrations: ['src/typeorm/migration/*.ts'],
      subscribers: [],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 2000,
          limit: 1,
        },]
    }),
    CacheModule.register({
      ttl: 60 * 120,
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  }, {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    }],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetUserMiddleware).forRoutes('*');
    consumer.apply(RegisterAccessMiddleware).forRoutes({ path: "/u/:id", method: RequestMethod.GET })
  }
}
