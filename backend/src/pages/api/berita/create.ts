import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError, sendValidationError } from '@/utils/response';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';

interface CreateBeritaRequest {
  judul: string;
  link_url: string;
  gambar?: string;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { judul, link_url, gambar }: CreateBeritaRequest = req.body;

      // Validation
      const errors: Record<string, string> = {};
      if (!judul) errors.judul = 'Judul berita diperlukan';
      if (!link_url) errors.link_url = 'Link URL diperlukan';

      if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
      }

      // Create berita
      const newBerita = await prisma.berita.create({
        data: {
          judul,
          link_url,
          gambar,
        },
      });

      await prisma.notifikasi.create({
        data: {
          judul: `Berita Baru: ${judul}`
        }
      });

      return sendSuccess(res, newBerita, 'Berita berhasil dibuat', 201);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Create berita error:', error);
    return sendError(res, 'Terjadi kesalahan saat membuat berita', 500);
  }
}

export default withRole(['admin', 'staff'])(handler);
