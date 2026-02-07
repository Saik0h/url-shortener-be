import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required');
    }

    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    if (!password || !hashed) {
      return false;
    }

    return bcrypt.compare(password, hashed);
  }
}
