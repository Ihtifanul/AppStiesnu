import type { NextApiResponse, NextApiRequest } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { comparePassword } from '@/utils/helpers';
import { generateToken } from '@/middleware/auth';

interface LoginRequest {
  username_or_email: string;
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { username_or_email, password }: LoginRequest = req.body;

    // Validation
    if (!username_or_email || !password) {
      return sendValidationError(res, {
        username_or_email: !username_or_email ? 'Username atau email diperlukan' : '',
        password: !password ? 'Password diperlukan' : '',
      });
    }

    // Find user by nama (username format) or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ nama: username_or_email }, { email: username_or_email }],
      },
    });

    if (!user) {
      return sendError(res, 'Username atau email tidak ditemukan', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Password salah', 401);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response
    return sendSuccess(
      res,
      {
        token,
        user: {
          id_user: user.id_user,
          nama: user.nama,
          email: user.email,
          role: user.role,
          foto_profil: user.foto_profil,
        },
      },
      'Login berhasil',
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Terjadi kesalahan saat login', 500);
  }
}
