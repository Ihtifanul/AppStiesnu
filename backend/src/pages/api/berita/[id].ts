import type { NextApiResponse, NextApiRequest } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    if (!id) {
      return sendError(res, 'ID berita diperlukan', 400);
    }

    if (req.method === 'GET') {
      const berita = await prisma.berita.findUnique({
        where: { id_berita: parseInt(String(id)) },
      });

      if (!berita) {
        return sendError(res, 'Berita tidak ditemukan', 404);
      }

      return sendSuccess(res, berita, 'Berita berhasil diambil', 200);
    } else if (req.method === 'PUT') {
      const berita = await prisma.berita.findUnique({
        where: { id_berita: parseInt(String(id)) },
      });

      if (!berita) {
        return sendError(res, 'Berita tidak ditemukan', 404);
      }

      if (req.user!.role !== 'admin' && req.user!.role !== 'staff') {
        return sendError(res, 'Anda tidak berhak mengubah berita', 403);
      }

      const { judul, link_url, gambar } = req.body;

      const errors: Record<string, string> = {};
      if (!judul) errors.judul = 'Judul berita diperlukan';
      if (!link_url) errors.link_url = 'Link URL diperlukan';

      if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
      }

      const updatedBerita = await prisma.berita.update({
        where: { id_berita: parseInt(String(id)) },
        data: {
          judul,
          link_url,
          gambar,
        },
      });

      return sendSuccess(res, updatedBerita, 'Berita berhasil diubah', 200);
    } else if (req.method === 'DELETE') {
      const berita = await prisma.berita.findUnique({
        where: { id_berita: parseInt(String(id)) },
      });

      if (!berita) {
        return sendError(res, 'Berita tidak ditemukan', 404);
      }

      if (req.user!.role !== 'admin' && req.user!.role !== 'staff') {
        return sendError(res, 'Anda tidak berhak menghapus berita ini', 403);
      }

      await prisma.berita.delete({
        where: { id_berita: parseInt(String(id)) },
      });

      return sendSuccess(res, null, 'Berita berhasil dihapus', 200);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Berita detail error:', error);
    return sendError(res, 'Terjadi kesalahan', 500);
  }
});
