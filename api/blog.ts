import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from './_utils/auth.js';
import { getStorage } from './_utils/storage.js';
import { insertBlogPostSchema, insertBlogCategorySchema, insertBlogMediaSchema } from '../shared/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.replace('/api/blog', '') || '/';
  const storage = getStorage();

  try {
    // Categories routes
    if (path === '/categories' && req.method === 'GET') {
      const categories = await storage.getAllCategories();
      return res.status(200).json(categories);
    }

    if (path === '/categories/create' && req.method === 'POST') {
      return adminAuth(req, res, async () => {
        const result = insertBlogCategorySchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid category data', details: result.error.issues });
        }
        const category = await storage.createCategory(result.data);
        return res.status(201).json(category);
      });
    }

    const categoryIdMatch = path.match(/^\/categories\/([^\/]+)$/);
    if (categoryIdMatch) {
      const id = categoryIdMatch[1];

      if (req.method === 'GET') {
        const category = await storage.getCategory(id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        return res.status(200).json(category);
      }

      if (req.method === 'PATCH') {
        return adminAuth(req, res, async () => {
          const result = insertBlogCategorySchema.partial().safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({ error: 'Invalid category data', details: result.error.issues });
          }
          const category = await storage.updateCategory(id, result.data);
          if (!category) return res.status(404).json({ error: 'Category not found' });
          return res.status(200).json(category);
        });
      }

      if (req.method === 'DELETE') {
        return adminAuth(req, res, async () => {
          const success = await storage.deleteCategory(id);
          if (!success) return res.status(404).json({ error: 'Category not found' });
          return res.status(200).json({ message: 'Category deleted successfully' });
        });
      }
    }

    // Posts routes
    if (path === '/posts' && req.method === 'GET') {
      const { published, categoryId, featured } = req.query;
      const filters: any = {};
      if (published !== undefined) filters.published = published === 'true';
      if (categoryId) filters.categoryId = categoryId as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      
      const posts = await storage.getAllPosts(filters);
      return res.status(200).json(posts);
    }

    if (path === '/posts/create' && req.method === 'POST') {
      return adminAuth(req, res, async () => {
        const result = insertBlogPostSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid post data', details: result.error.issues });
        }
        const post = await storage.createPost(result.data);
        return res.status(201).json(post);
      });
    }

    const postSlugMatch = path.match(/^\/posts\/([^\/]+)$/);
    if (postSlugMatch) {
      const slug = postSlugMatch[1];

      if (req.method === 'GET') {
        const post = await storage.getPostBySlug(slug);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        await storage.incrementViewCount(post.id);
        return res.status(200).json(post);
      }
    }

    const postIdMatch = path.match(/^\/posts\/id\/([^\/]+)$/);
    if (postIdMatch) {
      const id = postIdMatch[1];

      if (req.method === 'GET') {
        const post = await storage.getPost(id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        return res.status(200).json(post);
      }

      if (req.method === 'PATCH') {
        return adminAuth(req, res, async () => {
          const result = insertBlogPostSchema.partial().safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({ error: 'Invalid post data', details: result.error.issues });
          }
          const post = await storage.updatePost(id, result.data);
          if (!post) return res.status(404).json({ error: 'Post not found' });
          return res.status(200).json(post);
        });
      }

      if (req.method === 'DELETE') {
        return adminAuth(req, res, async () => {
          const success = await storage.deletePost(id);
          if (!success) return res.status(404).json({ error: 'Post not found' });
          return res.status(200).json({ message: 'Post deleted successfully' });
        });
      }
    }

    // Media routes
    const mediaByPostMatch = path.match(/^\/media\/by-post\/([^\/]+)$/);
    if (mediaByPostMatch && req.method === 'GET') {
      const postId = mediaByPostMatch[1];
      const media = await storage.getMediaByPostId(postId);
      return res.status(200).json(media);
    }

    if (path === '/media/create' && req.method === 'POST') {
      return adminAuth(req, res, async () => {
        const result = insertBlogMediaSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid media data', details: result.error.issues });
        }
        const media = await storage.createMedia(result.data);
        return res.status(201).json(media);
      });
    }

    const mediaIdMatch = path.match(/^\/media\/([^\/]+)$/);
    if (mediaIdMatch && req.method === 'DELETE') {
      return adminAuth(req, res, async () => {
        const id = mediaIdMatch[1];
        const success = await storage.deleteMedia(id);
        if (!success) return res.status(404).json({ error: 'Media not found' });
        return res.status(200).json({ message: 'Media deleted successfully' });
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
