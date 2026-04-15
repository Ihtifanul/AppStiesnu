import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { month, year, skip = '0', take = '50' } = req.query;

      const where: any = {
        user_id: req.user!.id_user,
      };

      if (month && year) {
        const startDate = new Date(parseInt(String(year)), parseInt(String(month)) - 1, 1);
        const endDate = new Date(parseInt(String(year)), parseInt(String(month)), 0);

        where.tanggal_kegiatan = {
          gte: startDate,
          lte: endDate,
        };
      }

      const jadwals = await prisma.jadwal.findMany({
        where,
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
        orderBy: { tanggal_kegiatan: 'asc' },
      });

      const total = await prisma.jadwal.count({ where });

      return sendSuccess(res, { jadwals, total }, 'Jadwal berhasil diambil', 200);
    } else if (req.method === 'POST') {
      const { nama_kegiatan, deskripsi_kegiatan, tanggal_kegiatan, waktu_kegiatan, pengulangan, warna_kegiatan } = req.body;

      if (!nama_kegiatan || !tanggal_kegiatan) {
        return sendError(res, 'Nama kegiatan dan Tanggal kegiatan wajib diisi', 400);
      }

      const jadwal = await prisma.jadwal.create({
        data: {
          nama_kegiatan,
          deskripsi_kegiatan,
          tanggal_kegiatan: new Date(tanggal_kegiatan),
          waktu_kegiatan: waktu_kegiatan ? new Date(waktu_kegiatan) : null,
          pengulangan: (pengulangan as any) || 'sekali',
          warna_kegiatan: warna_kegiatan || '#059669',
          user_id: req.user!.id_user,
        },
      });

      return sendSuccess(res, jadwal, 'Jadwal berhasil ditambahkan', 201);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Get jadwal error:', error);
    return sendError(res, 'Terjadi kesalahan saat mengambil jadwal', 500);
  }
}

export default withAuth(handler);
