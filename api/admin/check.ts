import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from '../_utils/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  adminAuth(req, res, () => {
    return res.status(200).json({ authenticated: true });
  });
}
