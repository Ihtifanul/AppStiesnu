import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';

interface CreateKalenderRequest {
  nama_event: string;
  deskripsi_event?: string;
  waktu_event: string;
  warna_event?: string;
  pengulangan?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { nama_event, deskripsi_event, waktu_event, warna_event, pengulangan }: CreateKalenderRequest = req.body;

      const errors: Record<string, string> = {};
      if (!nama_event) errors.nama_event = 'Nama event diperlukan';
      if (!waktu_event) errors.waktu_event = 'Waktu event diperlukan';

      if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
      }

      const newKalender = await prisma.kalender.create({
        data: {
          nama_event,
          deskripsi_event,
          waktu_event: new Date(waktu_event),
          warna_event: warna_event || '#4ADE80',
          pengulangan: typeof pengulangan === 'string' ? pengulangan : 'sekali'
        },
      });

      return sendSuccess(res, newKalender, 'Kalender berhasil dibuat', 201);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Create kalender error:', error);
    return sendError(res, 'Terjadi kesalahan saat membuat kalender', 500);
  }
}

export default withRole(['admin', 'staff'])(handler);
