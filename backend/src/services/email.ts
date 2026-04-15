import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_ENCRYPTION === 'ssl', // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Load and render email template with variables
 */
function loadTemplate(templateName: string, variables: Record<string, string>): string {
  const templatePath = path.join(
    process.cwd(),
    'src',
    'templates',
    `${templateName}.html`
  );

  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, value);
  });

  return html;
}

/**
 * Send OTP verification email
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  userName?: string
): Promise<boolean> {
  try {
    const html = loadTemplate('otp-email', {
      otp,
      userName: userName || 'Pengguna',
      expirationTime: '10 menit',
    });

    const mailOptions: EmailOptions = {
      to: email,
      subject: 'Kode Verifikasi OTP STIESNU',
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

/**
 * Send forgot password email with reset link and OTP
 */
export async function sendForgotPasswordEmail(
  email: string,
  otp: string,
  userName?: string
): Promise<boolean> {
  try {
    const html = loadTemplate('forgot-password-email', {
      otp,
      userName: userName || 'Pengguna',
      expirationTime: '30 menit',
      email: email,
    });

    const mailOptions: EmailOptions = {
      to: email,
      subject: 'Reset Password - STIESNU',
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Forgot password email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Failed to send forgot password email:', error);
    return false;
  }
}

/**
 * Test email configuration by sending a test email
 */
export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  try {
    const mailOptions: EmailOptions = {
      to: testEmail,
      subject: 'Test Email - STIESNU',
      html: `
        <body style="font-family: Arial, sans-serif;">
          <h2>Email Configuration Test</h2>
          <p>Jika Anda menerima email ini, konfigurasi SMTP berhasil!</p>
          <p>Email: ${process.env.MAIL_USERNAME}</p>
          <p>Host: ${process.env.MAIL_HOST}</p>
          <p>Port: ${process.env.MAIL_PORT}</p>
        </body>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}

export default { sendOtpEmail, sendForgotPasswordEmail, testEmailConfiguration };
