import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { validateEmail, generateOTP } from '@/utils/helpers';
import nodemailer from 'nodemailer';

interface RequestOTPRequest {
  email: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { email }: RequestOTPRequest = req.body;

    if (!email) {
      return sendValidationError(res, { email: 'Email diperlukan' });
    }

    if (!validateEmail(email)) {
      return sendValidationError(res, { email: 'Format email tidak valid' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar', 400);
    }

    const otp = generateOTP();

    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.emailOTP.upsert({
      where: { email },
      create: {
        email,
        otp,
        expires_at: otpExpiration,
      },
      update: {
        otp,
        expires_at: otpExpiration,
        is_verified: false,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: email,
      subject: 'Kode OTP Registrasi STIESNU Bengkulu',
      html: `<div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2>Kode OTP Registrasi Anda</h2>
        <p>Gunakan kode berikut untuk menyelesaikan proses registrasi akun STIESNU Bengkulu Anda.</p>
        <h1 style="color: #065f46; letter-spacing: 5px;">${otp}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
      </div>`,
    });

    console.log(`OTP untuk ${email}: ${otp} sent via email.`);

    return sendSuccess(res, { email }, 'OTP telah dikirim ke email Anda', 200);
  } catch (error) {
    console.error('Request OTP error:', error);
    return sendError(res, 'Terjadi kesalahan saat meminta OTP', 500);
  }
}
