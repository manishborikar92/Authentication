import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import path from 'path';
import { promises as fs } from 'fs';
import handlebars, { TemplateDelegate } from 'handlebars';

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  pool: true,
  rateLimit: true,
  maxConnections: 5,
  maxMessages: 100,
} as SMTPTransport.Options);

const templateCache: Map<string, TemplateDelegate> = new Map();

async function loadTemplate(name: string): Promise<TemplateDelegate> {
  if (templateCache.has(name)) return templateCache.get(name)!;
  
  const filePath = path.join(__dirname, `../templates/email/${name}.hbs`);
  const source = await fs.readFile(filePath, 'utf-8');
  const template = handlebars.compile(source);
  templateCache.set(name, template);
  return template;
}

/**
 * Sends an OTP email using a Handlebars template.
 * @param email Recipient's email address.
 * @param otp The OTP code.
 * @param expiryMinutes Number of minutes until the OTP expires.
 */
export async function sendOTPEmail(email: string, otp: string, expiryMinutes: number): Promise<void> {
  try {
    const template = await loadTemplate('otp');
    const html = template({ otp, expiryMinutes });
    
    await transport.sendMail({
      from: `"Virtual Vanguards" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Verification Code',
      html,
      headers: { 'X-OTP-Context': 'registration' }
    });
  } catch (error) {
    console.error('OTP Email Failed:', { email, error });
    throw new Error('Failed to send OTP email');
  }
}

/**
 * Sends a password reset OTP email using a Handlebars template.
 * @param email Recipient's email address.
 * @param otp The OTP code.
 * @param expiryMinutes Number of minutes until the OTP expires.
 */
export async function sendResetPasswordEmail(email: string, otp: string, expiryMinutes: number): Promise<void> {
  try {
    const template = await loadTemplate('resetPassword');
    const html = template({ otp, expiryMinutes });
    
    await transport.sendMail({
      from: `"Virtual Vanguards" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Password Reset Code',
      html,
      headers: { 'X-OTP-Context': 'password-reset' }
    });
  } catch (error) {
    console.error('Reset Password Email Failed:', { email, error });
    throw new Error('Failed to send reset password email');
  }
} 