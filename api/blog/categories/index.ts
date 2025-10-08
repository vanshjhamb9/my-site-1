import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    
    if (req.method === 'GET') {
      const categories = await storage.getAllCategories();
      return res.json(categories);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in categories endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
