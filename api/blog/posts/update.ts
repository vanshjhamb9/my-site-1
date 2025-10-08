import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';
import { adminAuth } from '../../_utils/auth';
import { insertBlogPostSchema } from '../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return adminAuth(req, res, async () => {
    try {
      const storage = getStorage();
      const { id } = req.query;
      const result = insertBlogPostSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid post data', details: result.error.issues });
      }
      
      const post = await storage.updatePost(id as string, result.data);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      return res.json(post);
    } catch (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({ error: 'Failed to update post' });
    }
  });
}
