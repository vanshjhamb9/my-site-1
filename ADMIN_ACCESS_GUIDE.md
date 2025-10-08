# Admin Access Guide

## 🔐 Admin Login

### Admin Panel URL
**Production (Vercel):** `https://your-vercel-domain.vercel.app/admin/blog`
**Local Development:** `http://localhost:5000/admin/blog`

### Admin Credentials
- **Password:** `admin123` (configured in `.env` as `ADMIN_PASSWORD`)

### How to Access

1. Navigate to `/admin/blog` in your browser
2. Enter the admin password: `admin123`
3. Click "Login" to access the blog administration panel

## 📝 Admin Panel Features

Once logged in, you can:
- ✅ Create new blog posts
- ✅ Edit existing posts  
- ✅ Delete posts
- ✅ Manage categories
- ✅ Set posts as published/draft
- ✅ Mark posts as featured
- ✅ Add cover images and media
- ✅ Manage SEO metadata

## 🌐 All Admin API Endpoints

### Authentication
All admin endpoints require the `X-Admin-Password` header:
```
X-Admin-Password: admin123
```

Or Bearer token:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Blog Categories

**List all categories (Public)**
- `GET /api/blog/categories`

**Get category by ID (Public)**
- `GET /api/blog/categories/[id]`

**Create category (Admin)**
- `POST /api/blog/categories/create`
- Headers: `X-Admin-Password: admin123`

**Update category (Admin)**
- `PUT /api/blog/categories/[id]`
- Headers: `X-Admin-Password: admin123`

**Delete category (Admin)**
- `DELETE /api/blog/categories/[id]`
- Headers: `X-Admin-Password: admin123`

### Blog Posts

**List all posts (Public)**
- `GET /api/blog/posts`
- Query params: `?published=true&categoryId=xxx&featured=true`

**Get post by slug (Public)**
- `GET /api/blog/posts/[slug]`

**Get post by ID (Admin)**
- `GET /api/blog/posts/id/[id]`
- Headers: `X-Admin-Password: admin123`

**Create post (Admin)**
- `POST /api/blog/posts/create`
- Headers: `X-Admin-Password: admin123`

**Update post (Admin)**
- `PUT /api/blog/posts/id/[id]`
- Headers: `X-Admin-Password: admin123`

**Delete post (Admin)**
- `DELETE /api/blog/posts/id/[id]`
- Headers: `X-Admin-Password: admin123`

### Blog Media

**Get media by post ID (Public)**
- `GET /api/blog/media/by-post/[postId]`

**Create media (Admin)**
- `POST /api/blog/media/create`
- Headers: `X-Admin-Password: admin123`

**Delete media (Admin)**
- `DELETE /api/blog/media/[id]`
- Headers: `X-Admin-Password: admin123`

## 🧪 Testing Admin Access

### Using cURL

**Create a blog post:**
```bash
curl -X POST https://your-domain.vercel.app/api/blog/posts/create \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: admin123" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "excerpt": "This is a test post",
    "content": "Full content here",
    "authorId": "your-author-id",
    "published": true
  }'
```

**Update a category:**
```bash
curl -X PUT https://your-domain.vercel.app/api/blog/categories/[id] \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: admin123" \
  -d '{
    "name": "Updated Category",
    "description": "Updated description"
  }'
```

**Delete a post:**
```bash
curl -X DELETE https://your-domain.vercel.app/api/blog/posts/id/[id] \
  -H "X-Admin-Password: admin123"
```

### Using JavaScript/Fetch

```javascript
// Create a post
await fetch('/api/blog/posts/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Password': 'admin123'
  },
  body: JSON.stringify({
    title: 'New Post',
    slug: 'new-post',
    excerpt: 'Post excerpt',
    content: 'Full content',
    authorId: 'user-id',
    published: true
  })
});

// Update a post
await fetch('/api/blog/posts/id/POST_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Password': 'admin123'
  },
  body: JSON.stringify({
    title: 'Updated Title'
  })
});
```

## 🔧 Environment Configuration

Make sure these are set in your Vercel environment variables:

```bash
# Admin Authentication
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=your-secret-token  # Optional alternative

# Database (Required)
DATABASE_URL=postgresql://...

# Email (Required for contact form)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=sales@neuralcoderai.com
```

## 🚀 Quick Start Checklist

- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Run database migrations: `npm run db:push`
- [ ] Navigate to `/admin/blog`
- [ ] Login with password: `admin123`
- [ ] Create your first blog post
- [ ] Test the contact form at `/contact`

## 📱 Admin Panel URLs Summary

| Feature | URL Path | Password Required |
|---------|----------|-------------------|
| **Admin Login** | `/admin/blog` | Yes (admin123) |
| **Public Blog** | `/blog` | No |
| **Blog Post Detail** | `/blog/[slug]` | No |
| **Home** | `/` | No |
| **About** | `/about` | No |
| **Services** | `/services` | No |
| **Portfolio** | `/portfolio` | No |
| **Contact** | `/contact` | No |
| **Team** | `/team` | No |
| **Primodia** | `/primodia` | No |

## 🔒 Security Notes

1. **Change the admin password** in production by updating the `ADMIN_PASSWORD` environment variable
2. The password is currently visible in the client code for demo purposes
3. For production use, implement proper session-based authentication
4. All admin API calls require the password header
5. Database credentials are kept secure in environment variables

## 🐛 Troubleshooting

### "Access Denied" Error
- Verify you're using the correct password: `admin123`
- Check that `ADMIN_PASSWORD` is set in Vercel environment variables

### "Database Error"
- Ensure `DATABASE_URL` is configured in Vercel
- Run `npm run db:push` to initialize the database schema

### "Email Not Sending"
- Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
- Check that the sending email is verified in Resend dashboard

### Module Not Found Errors
- Ensure all imports in `api/` folder use `.js` extensions
- Verify `vercel.json` includes the shared folder configuration
