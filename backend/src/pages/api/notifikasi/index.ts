import type { NextApiResponse, NextApiRequest } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { skip = '0', take = '20' } = req.query;

      const notifikasi = await prisma.notifikasi.findMany({
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
        orderBy: { createdAt: 'desc' },
      });

      const total = await prisma.notifikasi.count();

      return sendSuccess(res, { notifikasi, total }, 'Notifikasi berhasil diambil', 200);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Notification error:', error);
    return sendError(res, 'Terjadi kesalahan', 500);
  }
}

export default withAuth(handler);
