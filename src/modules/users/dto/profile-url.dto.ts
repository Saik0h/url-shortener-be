import { Transform, Type } from 'class-transformer';
import { formatDate } from '../../../common/helpers';
import { AccessDto } from '../../urls/dto/acces.dto';

export class UrlDto {
  id: string;
  original: string;

  @Transform(({ value }) => formatDate(value))
  createdAt: Date;

  @Transform(({ value }) => (value ? formatDate(value) : null))
  expiresAt?: Date;

  @Type(() => AccessDto)
  accessCount: AccessDto[];
}