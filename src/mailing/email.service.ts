import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  // Method to send the email with the verification code directly
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    // Prepare the raw HTML content
    const htmlContent = `
      <html>
        <body>
          <h3>Password Reset Verification</h3>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>If you did not request this, please ignore this email.</p>
        </body>
      </html>
    `;

    try {
      // Send the email with raw HTML content
      await this.mailerService.sendMail({
        to: email, // Recipient email address
        subject: 'Password Reset Verification Code', // Email subject
        html: htmlContent, // Raw HTML content
      });
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
