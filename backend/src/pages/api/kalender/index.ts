import type { NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/utils/response';

export default async function handler(req: any, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { month, year, skip = '0', take = '50' } = req.query;

      const where: any = {};

      if (month && year) {
        const startDate = new Date(parseInt(String(year)), parseInt(String(month)) - 1, 1);
        const endDate = new Date(parseInt(String(year)), parseInt(String(month)), 0);

        where.waktu_event = {
          gte: startDate,
          lte: endDate,
        };
      }

      const kalender = await prisma.kalender.findMany({
        where,
        skip: parseInt(String(skip)),
        take: parseInt(String(take)),
        orderBy: { waktu_event: 'asc' },
      });

      const total = await prisma.kalender.count({ where });

      return sendSuccess(res, { kalender, total }, 'Kalender berhasil diambil', 200);
    } else {
      return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Get kalender error:', error);
    return sendError(res, 'Terjadi kesalahan saat mengambil kalender', 500);
  }
}
