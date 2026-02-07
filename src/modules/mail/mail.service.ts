import { Injectable } from '@nestjs/common';
import { MailProvider } from './dto/mail-provider.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NodeMailService implements MailProvider {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationCode(
    email: string,
    code: string,
    type: '2fa' | 'email-confirmation',
  ): Promise<void> {
    const url = `http://localhost:3000/verification/verify/${type}?code=${code}`;

    await this.mailerService.sendMail({
      to: email,
      subject: type === '2fa' ? 'Your verification code' : 'Confirm your email',
      template: type === '2fa' ? './2fa' : './confirmation',
      context: {
        email,
        code,
        url,
      },
    });
  }
}
