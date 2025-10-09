import { 
  type User, 
  type InsertUser,
  type Lead,
  type InsertLead,
  type BlogPost,
  type InsertBlogPost,
  type BlogCategory,
  type InsertBlogCategory,
  type BlogMedia,
  type InsertBlogMedia,
  users,
  leads,
  blogCategories,
  blogPosts,
  blogMedia
} from "../../shared/schema.js";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, sql as drizzleSql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: string, status: string): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  getAllCategories(): Promise<BlogCategory[]>;
  getCategory(id: string): Promise<BlogCategory | undefined>;
  getCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  createCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateCategory(id: string, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  getAllPosts(filters?: { published?: boolean; categoryId?: string; featured?: boolean }): Promise<BlogPost[]>;
  getPost(id: string): Promise<BlogPost | undefined>;
  getPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createPost(post: InsertBlogPost): Promise<BlogPost>;
  updatePost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deletePost(id: string): Promise<boolean>;
  incrementViewCount(id: string): Promise<void>;
  getMediaByPostId(postId: string): Promise<BlogMedia[]>;
  createMedia(media: InsertBlogMedia): Promise<BlogMedia>;
  deleteMedia(id: string): Promise<boolean>;
}

class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const queryClient = neon(process.env.DATABASE_URL);
    this.db = drizzle(queryClient);
    
    // Initialize default admin user
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    try {
      const existingAdmin = await this.db
        .select()
        .from(users)
        .where(eq(users.id, "admin"));
      
      if (existingAdmin.length === 0) {
        await this.db.insert(users).values({
          id: "admin",
          username: "admin",
          password: "default_password",
          isAdmin: true,
        });
      }
    } catch (error) {
      // Silently ignore if already exists
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllLeads(): Promise<Lead[]> {
    return await this.db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await this.db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await this.db.insert(leads).values(insertLead).returning();
    return result[0];
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead | undefined> {
    const result = await this.db
      .update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await this.db.delete(leads).where(eq(leads.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllCategories(): Promise<BlogCategory[]> {
    return await this.db.select().from(blogCategories);
  }

  async getCategory(id: string): Promise<BlogCategory | undefined> {
    const result = await this.db.select().from(blogCategories).where(eq(blogCategories.id, id));
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    const result = await this.db.select().from(blogCategories).where(eq(blogCategories.slug, slug));
    return result[0];
  }

  async createCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const result = await this.db.insert(blogCategories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const result = await this.db
      .update(blogCategories)
      .set(category)
      .where(eq(blogCategories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.db.delete(blogCategories).where(eq(blogCategories.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllPosts(filters?: { published?: boolean; categoryId?: string; featured?: boolean }): Promise<BlogPost[]> {
    let query = this.db.select().from(blogPosts);
    
    const conditions: any[] = [];
    if (filters?.published !== undefined) {
      conditions.push(eq(blogPosts.published, filters.published));
    }
    if (filters?.categoryId) {
      conditions.push(eq(blogPosts.categoryId, filters.categoryId));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(blogPosts.featuredPost, filters.featured));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.orderBy(desc(blogPosts.createdAt));
    return result;
  }

  async getPost(id: string): Promise<BlogPost | undefined> {
    const result = await this.db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result[0];
  }

  async getPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const result = await this.db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return result[0];
  }

  async createPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await this.db.insert(blogPosts).values({
      ...post,
      publishedAt: post.published ? new Date() : null
    }).returning();
    return result[0];
  }

  async updatePost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existing = await this.getPost(id);
    if (!existing) return undefined;

    const result = await this.db
      .update(blogPosts)
      .set({
        ...post,
        updatedAt: new Date(),
        publishedAt: post.published && !existing.published ? new Date() : existing.publishedAt
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    await this.db.delete(blogMedia).where(eq(blogMedia.blogPostId, id));
    const result = await this.db.delete(blogPosts).where(eq(blogPosts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .update(blogPosts)
      .set({ viewCount: drizzleSql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, id));
  }

  async getMediaByPostId(postId: string): Promise<BlogMedia[]> {
    return await this.db.select().from(blogMedia).where(eq(blogMedia.blogPostId, postId));
  }

  async createMedia(media: InsertBlogMedia): Promise<BlogMedia> {
    const result = await this.db.insert(blogMedia).values(media).returning();
    return result[0];
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await this.db.delete(blogMedia).where(eq(blogMedia.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const getStorage = (): IStorage => {
  return new DatabaseStorage();
};
