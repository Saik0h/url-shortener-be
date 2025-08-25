import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { UrlsService } from './modules/urls/urls.service';

@Module({
  imports: [
    UrlsModule,
    AuthModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SetUserMiddleware).forRoutes('*');
    consumer.apply(RegisterAccessMiddleware).forRoutes({path: "/u/:id", method: RequestMethod.GET })
  }
}
