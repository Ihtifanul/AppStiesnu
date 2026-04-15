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
    const totalUsers = await prisma.user.count();
    const totalBerita = await prisma.berita.count();

    return sendSuccess(
      res,
      { totalUsers, totalBerita },
      'Statistik berhasil diambil',
      200
    );
  } catch (error) {
    console.error('Stats error:', error);
    return sendError(res, 'Terjadi kesalahan saat mengambil statistik', 500);
  }
}

export default withAuth(handler);
