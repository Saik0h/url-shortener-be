import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from '../../typeorm/entity/Url';
import { Access } from '../../typeorm/entity/Access';

@Module({
  imports:[TypeOrmModule.forFeature([Url, Access])],
  controllers: [UrlsController],
  providers: [UrlsService],
  exports:[UrlsService]
})
export class UrlsModule {}
