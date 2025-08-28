import { Transform, Type } from 'class-transformer';
import { formatDate } from '../../../common/helpers';
import { UrlDto } from './profile-url.dto';

export class UserProfileDto {

  id: string;
  name: string;
  email: string;

  @Transform(({ value }) => formatDate(value))
  memberSince: Date;

  @Type(() => UrlDto)
  urls: UrlDto[];

  constructor(partial: Partial<UserProfileDto>) {
    Object.assign(this, partial);
  }
}