import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage.js';
import { adminAuth } from '../../_utils/auth.js';
import { insertBlogCategorySchema } from '../../../shared/schema.js';

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
    
    if (req.method === 'PUT') {
      return adminAuth(req, res, async () => {
        const result = insertBlogCategorySchema.partial().safeParse(req.body);
        
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid category data', details: result.error.issues });
        }
        
        const category = await storage.updateCategory(id as string, result.data);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        
        return res.json(category);
      });
    }
    
    if (req.method === 'DELETE') {
      return adminAuth(req, res, async () => {
        const success = await storage.deleteCategory(id as string);
        
        if (!success) {
          return res.status(404).json({ error: 'Category not found' });
        }
        
        return res.json({ message: 'Category deleted successfully' });
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in category endpoint:', error);
    return res.status(500).json({ error: 'Failed to process category request' });
  }
}
