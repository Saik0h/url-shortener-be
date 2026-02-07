import { Module } from '@nestjs/common';
import { NodeMailService } from './mail.service';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../typeorm/entity/User';
import { Verification } from '../../typeorm/entity/Verification';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <trashtaker9@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forFeature([Verification, User]),
  ],
  providers: [VerificationService, NodeMailService],
  controllers: [VerificationController],
  exports: [NodeMailService],
})
export class MailModule {}
