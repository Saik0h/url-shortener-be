import { Injectable } from '@nestjs/common';
import { configDotenv } from 'dotenv';

@Injectable()
export class ConfigService {
  databaseName: string;
  databasePassword: string;
  databaseHost: string;
  databasePort: number;
  databaseUser: string;

  constructor() {
    configDotenv();
    this.databaseHost = process.env.DB_HOST;
    this.databasePort = Number(process.env.DB_PORT);
    this.databaseName = process.env.DB_NAME;
    this.databasePassword = process.env.DB_PASSWORD;
    this.databaseUser = process.env.DB_USER;
  }

  getDbName = (): string => this.databaseName;
  getDbHost = (): string => this.databaseHost;
  getDbPassword = (): string => this.databasePassword;
  getDbUser = (): string => this.databaseUser;
  getDbPort = (): number => this.databasePort;
}

export const configs = new ConfigService();
