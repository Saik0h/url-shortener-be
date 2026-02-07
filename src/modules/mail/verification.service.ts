import { Injectable, BadRequestException } from '@nestjs/common';
import {
  SendVerificationPayload,
  VerifyCodePayload,
} from './dto/verification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Verification,
  VerificationType,
} from '../../typeorm/entity/Verification';
import { MoreThan, Repository } from 'typeorm';
import { addMinutes } from 'date-fns';
import { User } from '../../typeorm/entity/User';
import { NodeMailService } from './mail.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly mailProvider: NodeMailService,
    @InjectRepository(Verification)
    private readonly verificationRepo: Repository<Verification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async send(payload: { id: string } & SendVerificationPayload) {
    const code = this.generateCode();

    await this.verificationRepo.save({
      userId: payload.id,
      code,
      type: payload.type,
      expiresAt: addMinutes(new Date(), 10),
    });

    await this.mailProvider.sendVerificationCode(
      payload.email,
      code,
      payload.type,
    );
  }

  async verify(payload: VerifyCodePayload) {
    const findValid = async (
      userId: string,
      code: string,
      type?: VerificationType,
    ) =>
      this.verificationRepo.findOne({
        where: {
          userId: userId,
          code: code,
          used: false,
          ...(type && { type }),
          expiresAt: MoreThan(new Date()),
        },
      });

    const record = await findValid(payload.userId, payload.code);

    if (!record) {
      throw new BadRequestException('Invalid or expired code');
    }
    const invalidate = async (id: string) => {
      await this.verificationRepo.update(id, { used: true });
    };
    await invalidate(record.id);
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyCode(type: VerificationType, code: string) {
    const verification = await this.verificationRepo.findOne({
      where: {
        code,
        type,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired code');
    }

    verification.used = true;
    await this.verificationRepo.save(verification);

    if (type === 'email-confirmation') {
      await this.userRepo.update(
        { id: verification.userId },
        { emailVerified: true },
      );
    }

    return { success: true };
  }
}
