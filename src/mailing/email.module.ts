import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailersend.net', // Your SMTP server details
        port: 587,
        auth: {
          user: 'MS_RvMwam@trial-pxkjn418d3qlz781.mlsender.net',
          pass: 'QnudgQ7Pduh9uhS3',
        },
      },
      defaults: {
        from: '"No Reply" <MS_RvMwam@trial-pxkjn418d3qlz781.mlsender.net>',
      },
      // No template section, as we are sending raw HTML content
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailModule {}
