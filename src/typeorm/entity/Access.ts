import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Url } from './Url';

@Entity()
export class Access {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  when: Date;

  @Column()
  ip: string;

  @ManyToOne(() => Url, (url) => url.accessCount, { onDelete: 'CASCADE' })
  url: Url;
}
