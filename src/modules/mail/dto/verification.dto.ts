export interface SendVerificationPayload {
  email: string;
  type: '2fa' | 'email-confirmation';
}

export interface VerifyCodePayload {
  userId: string;
  code: string;
}
