import { Transform, Type } from 'class-transformer';
import { AccessDto } from '../../urls/dto/acces.dto';

export class UrlDto {
  id: string;
  original: string;

  @Transform(({ value }) => value.toLocaleString())
  createdAt: string;

  @Transform(({ value }) => value.toLocaleString())
  expiresAt?: Date;

  @Type(() => AccessDto)
  accessCount: AccessDto[];
}
