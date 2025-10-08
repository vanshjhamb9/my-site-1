import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from '../../../_utils/auth.js';
import { getStorage } from '../../../_utils/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid lead ID' });
  }

  adminAuth(req, res, async () => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const storage = getStorage();
      const lead = await storage.updateLeadStatus(id, status);
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      return res.status(200).json(lead);
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      return res.status(500).json({ error: 'Failed to update lead status' });
    }
  });
}
