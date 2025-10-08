import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from '../../_utils/auth.js';
import { getStorage } from '../../_utils/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid lead ID' });
  }

  if (req.method === 'GET') {
    adminAuth(req, res, async () => {
      try {
        const storage = getStorage();
        const lead = await storage.getLead(id);
        
        if (!lead) {
          return res.status(404).json({ error: 'Lead not found' });
        }
        
        return res.status(200).json(lead);
      } catch (error: any) {
        console.error('Error fetching lead:', error);
        return res.status(500).json({ error: 'Failed to fetch lead' });
      }
    });
  } else if (req.method === 'DELETE') {
    adminAuth(req, res, async () => {
      try {
        const storage = getStorage();
        const success = await storage.deleteLead(id);
        
        if (!success) {
          return res.status(404).json({ error: 'Lead not found' });
        }
        
        return res.status(200).json({ message: 'Lead deleted successfully' });
      } catch (error: any) {
        console.error('Error deleting lead:', error);
        return res.status(500).json({ error: 'Failed to delete lead' });
      }
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
