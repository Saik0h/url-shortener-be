import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Access } from './Access';

@Entity()
export class Url {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  id?: string;

  @Column()
  original: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column()
  publishedBy: string;

  @OneToMany(() => Access, (access) => access.url, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  accessCount: Access[];

  @ManyToOne(() => User, (user) => user.urls)
  user: User;

  @BeforeInsert()
  setDefaultExpiry() {
    if (!this.expiresAt) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      this.expiresAt = now;
    }
  }
}
