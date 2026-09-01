import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

import config from "../config/env.js";

if (
  !config.EMAIL ||
  !config.EMAIL_PASSWORD
) {
  throw new Error(
    "CRITICAL: Email credentials " +
      "(EMAIL and EMAIL_PASSWORD) " +
      "are missing in .env file",
  );
}

const transporter =
  nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure:
      config.EMAIL_PORT === 465,

    auth: {
      user: config.EMAIL,
      pass: config.EMAIL_PASSWORD,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const sendMail = async (
  mailOptions: MailOptions,
): Promise<void> => {
  const options: SendMailOptions = {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
    text: mailOptions.text,
  };

  await transporter.sendMail(options);
};

export default sendMail;