import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { hashPassword, validateEmail, generateOTP } from '@/utils/helpers';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { step, email, otp, newPassword, confirmPassword } = req.body;

    // ── Step 1: Kirim OTP ke email ──────────────────────────────────────────
    if (step === 'request') {
      if (!email) return sendValidationError(res, { email: 'Email diperlukan' });
      if (!validateEmail(email)) return sendValidationError(res, { email: 'Format email tidak valid' });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return sendError(res, 'Email tidak ditemukan dalam sistem', 404);

      const generatedOtp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.emailOTP.upsert({
        where: { email },
        create: { email, otp: generatedOtp, expires_at: expiresAt },
        update: { otp: generatedOtp, expires_at: expiresAt, is_verified: false },
      });

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.MAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.MAIL_PORT || '587'),
          secure: false,
          auth: { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD },
        });
        await transporter.sendMail({
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
          to: email,
          subject: 'Reset Password STIESNU Bengkulu',
          html: `<div style="font-family:sans-serif;text-align:center;padding:20px">
            <h2>Reset Password</h2>
            <p>Gunakan kode OTP berikut untuk mereset password akun STIESNU Anda.</p>
            <h1 style="color:#065f46;letter-spacing:5px">${generatedOtp}</h1>
            <p>Berlaku selama <strong>10 menit</strong>.</p>
          </div>`,
        });
      } catch (mailErr) {
        console.error('Mail error (non-fatal):', mailErr);
      }

      return sendSuccess(res, { email }, 'OTP reset password dikirim ke email Anda', 200);
    }

    // ── Step 2: Verifikasi OTP + simpan password baru ─────────────────────
    if (step === 'reset') {
      if (!email || !otp || !newPassword || !confirmPassword) {
        return sendError(res, 'Semua field wajib diisi', 400);
      }
      if (newPassword !== confirmPassword) {
        return sendError(res, 'Konfirmasi password tidak cocok', 400);
      }
      if (newPassword.length < 6) {
        return sendError(res, 'Password minimal 6 karakter', 400);
      }

      const validOtp = await prisma.emailOTP.findFirst({
        where: { email, otp, is_verified: false, expires_at: { gt: new Date() } }
      });

      if (!validOtp) return sendError(res, 'Kode OTP tidak valid atau sudah kadaluarsa', 400);

      await prisma.emailOTP.delete({ where: { id: validOtp.id } });

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

      // Bersihkan semua OTP yang sudah expired
      await prisma.emailOTP.deleteMany({ where: { expires_at: { lt: new Date() } } });

      return sendSuccess(res, null, 'Password berhasil direset. Silakan login.', 200);
    }

    return sendError(res, 'Step tidak valid. Gunakan "request" atau "reset".', 400);

  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, 'Terjadi kesalahan saat reset password', 500);
  }
}
