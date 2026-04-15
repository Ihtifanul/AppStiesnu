import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

interface CreateJadwalRequest {
  nama_kegiatan: string;
  deskripsi_kegiatan?: string;
  tanggal_kegiatan: string;
  waktu_kegiatan?: string;
  pengulangan?: string;
  pengingat?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { nama_kegiatan, deskripsi_kegiatan, tanggal_kegiatan, waktu_kegiatan, pengulangan, pengingat }: CreateJadwalRequest = req.body;

      const errors: Record<string, string> = {};
      if (!nama_kegiatan) errors.nama_kegiatan = 'Nama kegiatan diperlukan';
      if (!tanggal_kegiatan) errors.tanggal_kegiatan = 'Tanggal kegiatan diperlukan';

      if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
      }

      const newJadwal = await prisma.jadwal.create({
        data: {
          nama_kegiatan,
          deskripsi_kegiatan,
          tanggal_kegiatan: new Date(tanggal_kegiatan),
          waktu_kegiatan: waktu_kegiatan ? new Date(waktu_kegiatan) : null,
          pengulangan: (pengulangan as any) || 'sekali',
          pengingat: (pengingat as any) || 'tidak_ada',
          user_id: req.user!.id_user,
        },
      });

      return sendSuccess(res, newJadwal, 'Jadwal berhasil dibuat', 201);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Create jadwal error:', error);
    return sendError(res, 'Terjadi kesalahan saat membuat jadwal', 500);
  }
}

export default withAuth(handler);
