import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    const { id } = req.query;
    
    if (req.method === 'GET') {
      const category = await storage.getCategory(id as string);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.json(category);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in category endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch category' });
  }
}
