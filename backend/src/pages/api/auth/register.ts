import type { NextApiResponse, NextApiRequest } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { hashPassword, validateEmail } from '@/utils/helpers';
import { generateToken } from '@/middleware/auth';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  otp: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { username, email, password, otp }: RegisterRequest = req.body;

    const errors: Record<string, string> = {};

    if (!username) errors.username = 'Username diperlukan';
    if (!email) errors.email = 'Email diperlukan';
    if (!password) errors.password = 'Password diperlukan';
    if (!otp) errors.otp = 'OTP diperlukan';

    if (Object.keys(errors).length > 0) {
      return sendValidationError(res, errors);
    }

    if (!validateEmail(email)) {
      return sendValidationError(res, { email: 'Format email tidak valid' });
    }

    if (password.length < 6) {
      return sendValidationError(res, { password: 'Password minimal 6 karakter' });
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar. Gunakan email lain atau login.', 400);
    }

    // Verify OTP - must be valid and not expired
    const validOtp = await prisma.emailOTP.findFirst({
      where: {
        email,
        otp,
        is_verified: false,
        expires_at: { gt: new Date() }
      }
    });

    if (!validOtp) {
      return sendError(res, 'Kode OTP tidak valid atau sudah kadaluarsa (10 menit)', 400);
    }

    // Delete OTP after use (cleanup DB)
    await prisma.emailOTP.delete({ where: { id: validOtp.id } });

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        nama: username,
        email,
        password: hashedPassword,
        role: 'user',
      },
    });

    // Cleanup any other expired OTPs for housekeeping
    await prisma.emailOTP.deleteMany({
      where: { expires_at: { lt: new Date() } }
    });

    const token = generateToken(newUser);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id_user: newUser.id_user,
          nama: newUser.nama,
          email: newUser.email,
          role: newUser.role,
          foto_profil: newUser.foto_profil,
        },
      },
      'Registrasi berhasil. Selamat bergabung!',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, 'Terjadi kesalahan saat registrasi', 500);
  }
}
