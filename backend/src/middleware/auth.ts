import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id_user: number;
    username: string;
    email: string;
    role: string;
  };
}

export const verifyToken = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const withAuth = (fn: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    return fn(req, res);
  };
};

export const withRole = (roles: string[]) => {
  return (fn: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      }
      return fn(req, res);
    });
  };
};

export const generateToken = (user: any): string => {
  const secret = (process.env.JWT_SECRET || 'default-secret-key') as string;
  const token = jwt.sign(
    {
      id_user: user.id_user,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' } as any
  );
  return token;
};
