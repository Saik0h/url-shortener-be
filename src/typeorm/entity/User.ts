import { Entity, Column,  CreateDateColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Url } from './Url';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @CreateDateColumn()
  memberSince: Date;

  @OneToMany(() => Url, (url) => url.user)
  urls: Url[];

  
}