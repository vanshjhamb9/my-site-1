import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    const { slug } = req.query;
    
    if (req.method === 'GET') {
      const post = await storage.getPostBySlug(slug as string);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      await storage.incrementViewCount(post.id);
      const media = await storage.getMediaByPostId(post.id);
      
      return res.json({ ...post, media });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in post endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
}
