import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    const { postId } = req.query;
    
    if (req.method === 'GET') {
      const media = await storage.getMediaByPostId(postId as string);
      return res.json(media);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in media endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch media' });
  }
}
