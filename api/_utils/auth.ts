import type { VercelRequest, VercelResponse } from '@vercel/node';

export const adminAuth = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken && token === adminToken) {
      return next();
    }
  }
  
  const adminPassword = req.headers['x-admin-password'] as string;
  const envAdminPassword = process.env.ADMIN_PASSWORD;
  if (envAdminPassword && adminPassword === envAdminPassword) {
    return next();
  }
  
  return res.status(401).json({ error: 'Unauthorized: Admin access required' });
};
