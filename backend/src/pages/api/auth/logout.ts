import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSuccess, sendError } from '@/utils/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Clear auth token from client side
    res.setHeader('Set-Cookie', 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;');

    return sendSuccess(res, null, 'Logout berhasil', 200);
  } catch (error) {
    console.error('Logout error:', error);
    return sendError(res, 'Terjadi kesalahan saat logout', 500);
  }
}
