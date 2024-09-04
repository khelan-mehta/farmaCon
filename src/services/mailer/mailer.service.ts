import { Injectable } from '@nestjs/common';
import { log } from 'console';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'adityarajcoder09@gmail.com',
        pass: 'gvksrridgzhadfsc'
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: 'adityarajcoder09@gmail.com',
      to,
      subject,
      text,
    };

    try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        console.log(mailOptions);
        
      } catch (error) {
        console.error('Error sending email: ', error);
      }
  }
}
