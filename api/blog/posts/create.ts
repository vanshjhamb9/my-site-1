import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage } from '../../_utils/storage.js';
import { adminAuth } from '../../_utils/auth.js';
import { insertBlogPostSchema } from '../../../shared/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return adminAuth(req, res, async () => {
    try {
      const storage = getStorage();
      const result = insertBlogPostSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid post data', details: result.error.issues });
      }
      
      if (!result.data.slug) {
        result.data.slug = result.data.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }
      
      const existingPost = await storage.getPostBySlug(result.data.slug);
      if (existingPost) {
        result.data.slug = `${result.data.slug}-${Date.now()}`;
      }
      
      const post = await storage.createPost(result.data);
      return res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  });
}
