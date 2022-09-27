import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ) {

    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context,
    });
  }
}
