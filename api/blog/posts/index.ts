import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    
    if (req.method === 'GET') {
      const { published, categoryId, featured } = req.query;
      const filters: any = {};
      
      if (published !== undefined) filters.published = published === 'true';
      if (categoryId) filters.categoryId = categoryId as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      
      const posts = await storage.getAllPosts(filters);
      return res.json(posts);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in posts endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
}
