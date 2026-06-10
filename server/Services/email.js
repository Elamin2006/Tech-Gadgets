import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

if (!process.env.EMAIL || !process.env.USERPASS) {
  throw new Error("CRITICAL: Email credentials (EMAIL or USERPASS) are missing in .env file!");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.USERPASS,
  },
});

export const buildResetMailOptions = (targetEmail, resetCode) => {
  return {
    from: {
      name: "Tech Gadgets Support Team",
      address: process.env.EMAIL, 
    },
    to: targetEmail, 
    subject: "Reset Your Password",
    text: `Your password reset code is: ${resetCode}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
            .email-header { background-color: #007BFF; color: #ffffff; text-align: center; padding: 20px; }
            .email-body { padding: 20px; color: #333333; line-height: 1.6; text-align: center; }
            .email-footer { background-color: #f4f4f4; color: #666666; text-align: center; padding: 10px; font-size: 14px; }
            .code-display { display: inline-block; background-color: #f8f9fa; color: #007BFF; font-size: 2rem; font-weight: bold; letter-spacing: 5px; padding: 10px 30px; border: 2px dashed #007BFF; border-radius: 5px; margin: 20px auto; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Welcome to Our Service</h1>
            </div>
            <div class="email-body">
                <p>Dear Customer,</p>
                <p>Your Verify Code For Reset Password is:</p>
                <div class="code-display">${resetCode}</div> <p>If you have any questions or need assistance, feel free to contact us at any time.</p>
            </div>
            <div class="email-footer">
                <p>&copy; 2026 SEF Academy. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `
  };
};

export const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email has been Sent successfully!");
    return info; 
  } catch (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};