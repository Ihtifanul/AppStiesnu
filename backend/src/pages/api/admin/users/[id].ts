import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { hashPassword } from '@/utils/helpers';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return sendError(res, 'User ID diperlukan', 400);
  }

  // Double check admin role
  if (req.user?.role !== 'admin') {
    return sendError(res, 'Forbidden', 403);
  }

  try {
    if (req.method === 'DELETE') {
      const user = await prisma.user.findUnique({ where: { id_user: parseInt(String(id)) } });
      if (!user) return sendError(res, 'User tidak ditemukan', 404);

      // Prevent self delete
      if (user.id_user === req.user.id_user) {
        return sendError(res, 'Tidak dapat menghapus akun sendiri', 400);
      }

      // Automatically Delete associated relationships to avoid foreign key checks issues. 
      // E.g., user schedule, etc. (prisma handles this via CASCADE if configured, but to be sure we just delete user if DB is set correctly)
      await prisma.user.delete({
        where: { id_user: parseInt(String(id)) }
      });

      return sendSuccess(res, null, 'User berhasil dihapus', 200);
    } 
    
    if (req.method === 'PUT') {
      const user = await prisma.user.findUnique({ where: { id_user: parseInt(String(id)) } });
      if (!user) return sendError(res, 'User tidak ditemukan', 404);

      const { nama, email, role, tanggal_lahir, password } = req.body;
      
      const errors: Record<string, string> = {};
      if (!nama) errors.nama = 'Nama diperlukan';
      if (!email) errors.email = 'Email diperlukan';
      if (!role) errors.role = 'Role diperlukan';
      
      if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
      }

      const updateData: any = {
        nama,
        email,
        role,
        tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
      };

      if (password) {
        updateData.password = await hashPassword(password);
      }

      const updatedUser = await prisma.user.update({
        where: { id_user: parseInt(String(id)) },
        data: updateData,
        select: {
          id_user: true,
          nama: true,
          email: true,
          role: true,
          foto_profil: true
        }
      });

      return sendSuccess(res, updatedUser, 'User berhasil diperbarui', 200);
    }

    return sendError(res, 'Method not allowed', 405);
  } catch (error) {
    console.error('Admin users ID error:', error);
    return sendError(res, 'Terjadi kesalahan sistem saat memproses pengguna', 500);
  }
}

export default withAuth(handler);
