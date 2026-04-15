import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  // Double check admin role
  if (req.user?.role !== 'admin') {
    return sendError(res, 'Forbidden', 403);
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        foto_profil: true
      },
      orderBy: {
        id_user: 'desc'
      }
    });

    return sendSuccess(
      res,
      users,
      'Data pengguna berhasil diambil',
      200
    );
  } catch (error) {
    console.error('Users error:', error);
    return sendError(res, 'Terjadi kesalahan saat mengambil daftar pengguna', 500);
  }
}

export default withAuth(handler);
