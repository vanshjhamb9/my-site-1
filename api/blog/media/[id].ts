import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage.js';
import { adminAuth } from '../../_utils/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const storage = getStorage();
    const { id } = req.query;
    
    if (req.method === 'DELETE') {
      return adminAuth(req, res, async () => {
        const success = await storage.deleteMedia(id as string);
        
        if (!success) {
          return res.status(404).json({ error: 'Media not found' });
        }
        
        return res.json({ message: 'Media deleted successfully' });
      });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in media endpoint:', error);
    return res.status(500).json({ error: 'Failed to process media request' });
  }
}
