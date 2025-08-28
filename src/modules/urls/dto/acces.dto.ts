import { Transform } from 'class-transformer';
import { formatDate } from '../../../common/helpers';

export class AccessDto {
  @Transform(({ value }) => formatDate(value))
  when: Date;
}