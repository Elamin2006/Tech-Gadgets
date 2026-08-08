import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const emailUser = process.env.EMAIL;
const emailPassword = (
  process.env.USERPASS ||
  process.env.GMAIL_APP_PASSWORD ||
  process.env.APP_PASSWORD || "")
.replace(/\s+/g, "");

if (!emailUser || !emailPassword) {
  throw new Error(
    "CRITICAL: Email credentials (EMAIL or USERPASS/GMAIL_APP_PASSWORD/APP_PASSWORD) are missing in .env file!",
  );
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const buildResetMailOptions = (targetEmail, resetCode) => {
  return {
    from: `"Tech Gadgets Support" <${process.env.EMAIL}>`,
    to: targetEmail,
    subject: "Reset Your Password",
    text: `Your password reset code is: ${resetCode}. If you did not request this, ignore this email.`,
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
                    <h1>Security Verification</h1>
                </div>
                <div class="email-body">
                    <p>Dear Customer,</p>
                    <p>Your Verify Code For Reset Password is:</p>
                    <div class="code-display">${resetCode}</div>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
                <div class="email-footer">
                    <p>&copy; 2026 Tech Gadgets Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
  };
};

export const buildOrderMailOptions = (email, status, total) => {
  return {
    from: `"Tech Gadgets Support" <${process.env.EMAIL}>`,
    to: email,
    subject: `Your Order Status Update: ${status.toUpperCase()}`,
    text: `Your order status is now ${status}. Total price: $${total}. Visit your account to track the order.`,
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
                .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
                .email-header { background-color: #28a745; color: #ffffff; text-align: center; padding: 20px; }
                .email-body { padding: 20px; color: #333333; line-height: 1.6; }
                .email-footer { background-color: #f4f4f4; color: #666666; text-align: center; padding: 10px; font-size: 14px; }
                .button { display: inline-block; background-color: #28a745; color: #ffffff !important; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin-top: 15px; }
                .status { font-size: 1.5rem; font-weight: 800; text-transform: uppercase; color: #28a745; }
                .price-box { font-size: 1.8rem; font-weight: 900; color: #28a745; background-color: #f8f9fa; padding: 10px; border-radius: 5px; display: inline-block; margin-top: 10px; border: 1px dashed #28a745; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <h2>Order Update Notification</h2>
                </div>
                <div class="email-body">
                    <p>Dear Customer,</p>
                    <p>We are writing to inform you about the latest update regarding your purchase.</p>
                    <p>Your Current Order Status is: <span class="status">${status}</span></p>
                    <p><strong>Total Price of Your Order:</strong></p>
                    <div class="price-box">$${total}</div>
                    <br>
                    <div style="text-align:center;">
                        <a href="https://your-domain.com" class="button">Track Your Order</a>
                    </div>
                </div>
                <div class="email-footer">
                    <p>&copy; 2026 Tech Gadgets Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
  };
};

export const sendMail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[Email Success]: Email sent successfully.");
    return info;
  } catch (error) {
    const detail = error?.response || error?.message || "Unknown SMTP error";
    throw new Error(`Email delivery failed: ${detail}`);
  }
};

export const sendOrderEmail = async (email, status, total) => {
  try {
    const mailOptions = buildOrderMailOptions(email, status, total);
    await sendMail(mailOptions);
    console.log(
      `[Email Success]: Order notification sent smoothly to ${email}`,
    );
  } catch (error) {
    console.error(
      `[Email Error]: Failed to send order mail to ${email}`,
      error,
    );
  }
};