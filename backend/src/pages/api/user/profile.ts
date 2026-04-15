import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { hashPassword, comparePassword } from '@/utils/helpers';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const { nama, oldPassword, password, foto_profil } = req.body;
    const userId = req.user!.id_user;

    // Check if it's a password update or profile update
    if (oldPassword && password) {
      // Fetch user to verify old password
      const user = await prisma.user.findUnique({ where: { id_user: userId } });
      if (!user) return sendError(res, 'User tidak ditemukan', 404);

      const isValid = await comparePassword(oldPassword, user.password);
      if (!isValid) {
        return sendError(res, 'Password lama salah', 400);
      }

      // Cek password baru tidak sama dengan lama
      const isSame = await comparePassword(password, user.password);
      if (isSame) {
        return sendError(res, 'Password baru tidak boleh sama dengan password lama', 400);
      }

      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id_user: userId },
        data: { password: hashedPassword }
      });

      return sendSuccess(res, null, 'Password berhasil diperbarui', 200);
    }

    // Otherwise, it's a profile update (nama, tanggal_lahir)
    if (!nama) {
      return sendValidationError(res, { nama: 'Nama tidak boleh kosong' });
    }

    const updatedUser = await prisma.user.update({
      where: { id_user: userId },
      data: {
        nama,
        ...(foto_profil !== undefined && { foto_profil }),
      },
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        foto_profil: true
      }
    });

    return sendSuccess(res, updatedUser, 'Profil berhasil diperbarui', 200);

  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Terjadi kesalahan saat memperbarui profil', 500);
  }
}

export default withAuth(handler);
