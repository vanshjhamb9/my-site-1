import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from '../../_utils/auth.js';
import { getStorage } from '../../_utils/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  adminAuth(req, res, async () => {
    try {
      const storage = getStorage();
      const leads = await storage.getAllLeads();
      return res.status(200).json(leads);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
  });
}
