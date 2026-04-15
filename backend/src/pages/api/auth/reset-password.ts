import type { NextApiRequest, NextApiResponse } from 'next';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';

interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Validates password strength
 * Requirements: min 8 chars, uppercase letter, number, special character
 */
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password harus minimal 8 karakter',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal 1 huruf besar',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal 1 angka',
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal 1 karakter khusus (!@#$%^&*...)',
    };
  }

  return { valid: true };
}

/**
 * Reset Password Endpoint
 * Verifies OTP and updates user password
 *
 * POST /api/auth/reset-password
 * Body: { email: string; otp: string; newPassword: string; confirmPassword: string }
 * Response: { success: boolean; message: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Metode tidak diizinkan. Gunakan POST.',
    });
  }

  try {
    const { email, otp, newPassword, confirmPassword } = req.body as ResetPasswordRequest;

    // Validate all inputs
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi',
      });
    }

    // Validate email format
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak valid',
      });
    }

    // Validate OTP format (should be 6 digits)
    if (typeof otp !== 'string' || otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid. Gunakan 6 digit yang diterima di email',
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi password tidak cocok',
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message || 'Password tidak memenuhi persyaratan',
      });
    }

    // Find and verify OTP
    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email: email.toLowerCase(),
        otp,
        purpose: 'PASSWORD_RESET',
      },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid atau tidak ditemukan',
      });
    }

    // Check if OTP has expired
    if (otpRecord.expires_at < new Date()) {
      // Delete expired OTP
      await prisma.emailOTP.delete({
        where: { id: otpRecord.id },
      });

      return res.status(400).json({
        success: false,
        message: 'Kode OTP telah expired. Silakan minta kode baru',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan',
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update user password and delete used OTP
    await Promise.all([
      prisma.user.update({
        where: { id_user: user.id_user },
        data: { password: hashedPassword },
      }),
      prisma.emailOTP.delete({
        where: { id: otpRecord.id },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru Anda.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    });
  }
}
