import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';
import { adminAuth } from '../../_utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return adminAuth(req, res, async () => {
    try {
      const storage = getStorage();
      const { id } = req.query;
      const success = await storage.deletePost(id as string);
      
      if (!success) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  });
}
