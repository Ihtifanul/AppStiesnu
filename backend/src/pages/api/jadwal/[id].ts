import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

export default withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    if (!id) {
      return sendError(res, 'ID jadwal diperlukan', 400);
    }

    if (req.method === 'GET') {
      const jadwal = await prisma.jadwal.findUnique({
        where: { id_jadwal: parseInt(String(id)) },
      });

      if (!jadwal) {
        return sendError(res, 'Jadwal tidak ditemukan', 404);
      }

      if (jadwal.user_id !== req.user!.id_user && req.user!.role !== 'admin') {
        return sendError(res, 'Anda tidak berhak melihat jadwal ini', 403);
      }

      return sendSuccess(res, jadwal, 'Jadwal berhasil diambil', 200);
    } else if (req.method === 'PUT') {
      const jadwal = await prisma.jadwal.findUnique({
        where: { id_jadwal: parseInt(String(id)) },
      });

      if (!jadwal) {
        return sendError(res, 'Jadwal tidak ditemukan', 404);
      }

      if (jadwal.user_id !== req.user!.id_user && req.user!.role !== 'admin') {
        return sendError(res, 'Anda tidak berhak mengubah jadwal ini', 403);
      }

      const { nama_kegiatan, deskripsi_kegiatan, tanggal_kegiatan, waktu_kegiatan, pengulangan, pengingat } = req.body;

      const updatedJadwal = await prisma.jadwal.update({
        where: { id_jadwal: parseInt(String(id)) },
        data: {
          nama_kegiatan,
          deskripsi_kegiatan,
          tanggal_kegiatan: tanggal_kegiatan ? new Date(tanggal_kegiatan) : undefined,
          waktu_kegiatan: waktu_kegiatan ? new Date(waktu_kegiatan) : null,
          pengulangan,
          pengingat,
        },
      });

      return sendSuccess(res, updatedJadwal, 'Jadwal berhasil diubah', 200);
    } else if (req.method === 'DELETE') {
      const jadwal = await prisma.jadwal.findUnique({
        where: { id_jadwal: parseInt(String(id)) },
      });

      if (!jadwal) {
        return sendError(res, 'Jadwal tidak ditemukan', 404);
      }

      if (jadwal.user_id !== req.user!.id_user && req.user!.role !== 'admin') {
        return sendError(res, 'Anda tidak berhak menghapus jadwal ini', 403);
      }

      await prisma.jadwal.delete({
        where: { id_jadwal: parseInt(String(id)) },
      });

      return sendSuccess(res, null, 'Jadwal berhasil dihapus', 200);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Jadwal detail error:', error);
    return sendError(res, 'Terjadi kesalahan', 500);
  }
});
