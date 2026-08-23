import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

import config from "../config/env.js";

if (!config.EMAIL || !config.EMAIL_PASSWORD) {
  throw new Error(
    "CRITICAL: Email credentials (EMAIL and EMAIL_PASSWORD) are missing in .env file",
  );
}

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465,

  auth: {
    user: config.EMAIL,
    pass: config.EMAIL_PASSWORD,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  
    const mailOptions: SendMailOptions = {
      from: `"Tech Gadgets" <${config.EMAIL}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
 
};

export default sendMail;