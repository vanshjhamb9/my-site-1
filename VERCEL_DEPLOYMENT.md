# Vercel Deployment Guide

This project is configured for deployment on Vercel with serverless functions.

## Project Structure

```
├── api/                          # Vercel Serverless Functions
│   ├── _utils/                  # Shared utilities
│   │   ├── auth.ts             # Admin authentication middleware
│   │   └── storage.ts          # Database storage layer
│   ├── blog/
│   │   ├── categories/         # Category endpoints
│   │   ├── posts/              # Blog post endpoints
│   │   └── media/              # Media endpoints
│   └── contact.ts              # Contact form endpoint
├── client/                      # React frontend
├── shared/                      # Shared types and schemas
├── dist/                        # Build output (generated)
└── vercel.json                 # Vercel configuration
```

## Environment Variables

Configure these environment variables in your Vercel project settings:

### Required
- `DATABASE_URL` - PostgreSQL database connection string (Neon, Supabase, etc.)
- `RESEND_API_KEY` - Resend API key for email functionality
- `RESEND_FROM_EMAIL` - Email address to send from (verified in Resend)

### Optional (Admin Features)
- `ADMIN_TOKEN` - Bearer token for admin API authentication
- `ADMIN_PASSWORD` - Alternative admin password authentication

## API Endpoints

### Blog Categories
- `GET /api/blog/categories` - Get all categories
- `GET /api/blog/categories/[id]` - Get category by ID
- `POST /api/blog/categories/create` - Create category (admin)
- `PUT /api/blog/categories/[id]` - Update category (admin)
- `DELETE /api/blog/categories/[id]` - Delete category (admin)

### Blog Posts
- `GET /api/blog/posts` - Get all posts (supports filters: published, categoryId, featured)
- `GET /api/blog/posts/[slug]` - Get post by slug (public)
- `GET /api/blog/posts/id/[id]` - Get post by ID with media (admin)
- `POST /api/blog/posts/create` - Create post (admin)
- `PUT /api/blog/posts/id/[id]` - Update post (admin)
- `DELETE /api/blog/posts/id/[id]` - Delete post (admin)

### Blog Media
- `GET /api/blog/media/by-post/[postId]` - Get media by post ID
- `POST /api/blog/media/create` - Create media (admin)
- `DELETE /api/blog/media/[id]` - Delete media by ID (admin)

### Contact Form
- `POST /api/contact` - Submit contact form

## Deployment Steps

### 1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel dashboard
3. Configure environment variables
4. Deploy

#### Option B: Deploy via CLI
```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 3. Set up Database
1. Create a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
2. Add the `DATABASE_URL` to Vercel environment variables
3. Run database migrations:
```bash
npm run db:push
```

### 4. Configure Email Service
1. Sign up for Resend (https://resend.com)
2. Verify your domain or use their test domain
3. Create an API key
4. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to Vercel environment variables

### 5. Set up Admin Authentication
Add one or both authentication methods to environment variables:
- `ADMIN_TOKEN` - for Bearer token auth
- `ADMIN_PASSWORD` - for X-Admin-Password header auth

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

## Admin Authentication

When making admin API requests, include one of these headers:

### Bearer Token
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Admin Password
```
X-Admin-Password: YOUR_ADMIN_PASSWORD
```

## Database Schema

The project uses Drizzle ORM with PostgreSQL. Schema is defined in `shared/schema.ts`.

To push schema changes:
```bash
npm run db:push
```

## Troubleshooting

### API Routes Not Working
- Verify `vercel.json` is present in the root
- Check Vercel function logs in dashboard
- Ensure environment variables are set

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Vercel's IP ranges
- Check if database is properly migrated

### Email Not Sending
- Verify `RESEND_API_KEY` is valid
- Ensure sending email address is verified in Resend
- Check Vercel function logs for errors

## Performance Considerations

- Serverless functions have cold start times
- Database connections are created per request (using Neon HTTP driver for efficiency)
- Consider adding caching for frequently accessed data
- Use Vercel Edge Config or Redis for session management if needed
