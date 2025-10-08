import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage';
import { adminAuth } from '../../_utils/auth';
import { insertBlogMediaSchema } from '../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return adminAuth(req, res, async () => {
    try {
      const storage = getStorage();
      const result = insertBlogMediaSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid media data', details: result.error.issues });
      }
      
      const media = await storage.createMedia(result.data);
      return res.status(201).json(media);
    } catch (error) {
      console.error('Error creating media:', error);
      return res.status(500).json({ error: 'Failed to create media' });
    }
  });
}
