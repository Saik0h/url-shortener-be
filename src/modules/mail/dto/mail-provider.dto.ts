export interface MailProvider {
  sendVerificationCode(
    email: string,
    code: string,
    type: string,
  ): Promise<void>;
}