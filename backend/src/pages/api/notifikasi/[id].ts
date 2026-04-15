import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.user?.role !== 'admin') return sendError(res, 'Akses ditolak', 403);

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return sendError(res, 'ID tidak valid', 400);

  try {
    if (req.method === 'PUT') {
      const { judul, isi } = req.body;
      if (!judul) return sendError(res, 'Judul notifikasi wajib diisi', 400);
      const updated = await prisma.notifikasi.update({
        where: { id_notifikasi: id },
        data: { judul, isi } as any,
      });
      return sendSuccess(res, updated, 'Notifikasi berhasil diperbarui');

    } else if (req.method === 'DELETE') {
      await prisma.notifikasi.delete({ where: { id_notifikasi: id } });
      return sendSuccess(res, null, 'Notifikasi berhasil dihapus');

    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Notifikasi [id] error:', error);
    return sendError(res, 'Terjadi kesalahan', 500);
  }
}

export default withAuth(handler);
