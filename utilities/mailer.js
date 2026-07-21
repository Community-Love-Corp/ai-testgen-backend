/*
AUTHOR: Jay Sarna
DATE: 17 July 2026
DESCRIPTION: File manages outbound verification deliveries.
*/
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
let RelativeTransportSecurity;

if (process.env.SMTP_PORT=465){
  RelativeTransportSecurity = true;
}else{
  RelativeTransportSecurity = false;  
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT), // production traditionally uses 587 and local uses 465
  secure: RelativeTransportSecurity, // true for port 465, false for 587 (uses STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(toEmail, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"AI TestGen System" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verify Your Email Address - AI TestGen",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; color: #333;">
        <h2>Welcome to AI TestGen!</h2>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #00fff0; color: #1a1a2e; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
        <p style="font-size: 0.8rem; color: #666;">This is an automated message, please do not reply directly to this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("SMTP Message accepted successfully:", info.messageId);
  console.log("SMTP Response payload:", info.response);
  return info;
}
