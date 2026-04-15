import type { NextApiResponse, NextApiRequest } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { search, skip = '0', take = '10' } = req.query;

      const where: any = {};
      if (search) {
        where.judul = { contains: String(search) };
      }

      const berita = await prisma.berita.findMany({
        where,
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
        orderBy: { id_berita: 'desc' },
      });

      const total = await prisma.berita.count({ where });

      return sendSuccess(res, { berita, total }, 'Berita berhasil diambil', 200);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Get berita error:', error);
    return sendError(res, 'Terjadi kesalahan saat mengambil berita', 500);
  }
}
