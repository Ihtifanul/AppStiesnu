import type { NextApiResponse, NextApiRequest } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id) {
      return sendError(res, 'ID kalender diperlukan', 400);
    }

    if (req.method === 'GET') {
      const kalender = await prisma.kalender.findUnique({
        where: { id_event: parseInt(String(id)) },
      });

      if (!kalender) {
        return sendError(res, 'Kalender tidak ditemukan', 404);
      }

      return sendSuccess(res, kalender, 'Kalender berhasil diambil', 200);
    } else if (req.method === 'PUT') {
      const kalender = await prisma.kalender.findUnique({
        where: { id_event: parseInt(String(id)) },
      });

      if (!kalender) {
        return sendError(res, 'Kalender tidak ditemukan', 404);
      }

      const { nama_event, deskripsi_event, waktu_event, warna_event, pengulangan } = req.body;

      const updatedKalender = await prisma.kalender.update({
        where: { id_event: parseInt(String(id)) },
        data: {
          nama_event,
          deskripsi_event,
          waktu_event: waktu_event ? new Date(waktu_event) : undefined,
          warna_event,
          pengulangan: typeof pengulangan === 'string' ? pengulangan : undefined
        },
      });

      return sendSuccess(res, updatedKalender, 'Kalender berhasil diubah', 200);
    } else if (req.method === 'DELETE') {
      const kalender = await prisma.kalender.findUnique({
        where: { id_event: parseInt(String(id)) },
      });

      if (!kalender) {
        return sendError(res, 'Kalender tidak ditemukan', 404);
      }

      await prisma.kalender.delete({
        where: { id_event: parseInt(String(id)) },
      });

      return sendSuccess(res, null, 'Kalender berhasil dihapus', 200);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Kalender detail error:', error);
    return sendError(res, 'Terjadi kesalahan', 500);
  }
}
export default withRole(['admin', 'staff'])(handler);
