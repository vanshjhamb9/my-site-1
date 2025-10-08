import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';
import { adminAuth } from '../../_utils/auth';
import { insertBlogPostSchema } from '../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    const { id } = req.query;
    
    if (req.method === 'GET') {
      const post = await storage.getPost(id as string);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      const media = await storage.getMediaByPostId(post.id);
      return res.json({ ...post, media });
    }
    
    if (req.method === 'PUT') {
      return adminAuth(req, res, async () => {
        const result = insertBlogPostSchema.partial().safeParse(req.body);
        
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid post data', details: result.error.issues });
        }
        
        const post = await storage.updatePost(id as string, result.data);
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        return res.json(post);
      });
    }
    
    if (req.method === 'DELETE') {
      return adminAuth(req, res, async () => {
        const success = await storage.deletePost(id as string);
        
        if (!success) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        return res.json({ message: 'Post deleted successfully' });
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in post endpoint:', error);
    return res.status(500).json({ error: 'Failed to process post request' });
  }
}
