import { Transform } from 'class-transformer';

export class AccessDto {
  @Transform(({ value }) => value.toLocaleString())
  when: Date;
}