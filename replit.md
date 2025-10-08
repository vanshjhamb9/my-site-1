# Neural Coder AI - Project Overview

## Overview

Neural Coder AI is a professional AI and full-stack development agency website built as a modern, serverless web application. The platform showcases the company's services, portfolio, team, and includes a full-featured blog system with admin capabilities. The application uses a React-based frontend with Vite, deployed as serverless functions on Vercel, featuring a PostgreSQL database and email integration.

The site is designed to demonstrate the company's expertise in AI solutions, mobile development, full-stack engineering, and emerging technologies through an interactive, visually rich user experience with extensive animations and creative components.

## User Preferences

Preferred communication style: Simple, everyday language.

## Admin Panel

**Routes**
- `/admin/login` - Admin authentication page
- `/admin` - Admin dashboard with overview stats
- `/admin/leads` - Leads management (view, update status, delete)
- `/admin/blog` - Blog post management (existing BlogAdminGate)

**Features**
- Secure admin authentication via ADMIN_PASSWORD environment variable
- Leads tracking from contact form submissions
- Lead status management (new, contacted, qualified, closed)
- Direct email links for contacting leads
- Blog post creation and management
- Dashboard with quick stats and navigation

**Security Note**
- Current implementation uses password-based authentication with localStorage
- For production deployment, implement JWT tokens or session-based auth with httpOnly cookies
- All admin routes are protected by authentication middleware

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for optimized production builds
- Output directory: `dist/public` for Vercel static file serving
- Hot Module Replacement (HMR) enabled for development

**UI & Styling**
- Tailwind CSS with custom design system based on shadcn/ui components (New York style)
- Custom CSS variables for theming (dark mode by default with charcoal, slate, gold, and platinum colors)
- Framer Motion for advanced animations and scroll-based effects
- Glassmorphism and custom visual effects throughout

**State Management & Data Fetching**
- TanStack React Query (v5) for server state management and caching
- Wouter for lightweight client-side routing
- React Hook Form with Zod validation for forms

**Component Architecture**
- Page-based routing structure under `client/src/pages/`
- Reusable UI components in `client/src/components/`
- Shared schemas and types in `shared/` directory
- Path aliases configured: `@/` for client source, `@shared/` for shared code

### Backend Architecture

**Serverless Function Structure**
- Migrated from Express.js to Vercel Serverless Functions for scalability
- Functions organized in `api/` directory with feature-based routing
- Shared utilities in `api/_utils/` for authentication and storage layer
- Each endpoint is a separate serverless function for independent scaling

**API Structure**
- Admin Authentication: Login endpoint with password verification (`/api/admin/login`, `/api/admin/check`)
- Leads Management: CRUD operations for contact leads (`/api/admin/leads`)
- Blog Categories: CRUD operations for category management
- Blog Posts: Full blog post management with slug-based public access and ID-based admin access
- Blog Media: Image/media management associated with blog posts
- Contact Form: Email submission handling via Resend API (saves leads to database)

**Authentication & Authorization**
- Admin-only endpoints protected by custom middleware (`api/_utils/auth.ts`)
- Supports two authentication methods:
  1. Bearer token authentication via `ADMIN_TOKEN` environment variable
  2. Password-based authentication via `ADMIN_PASSWORD` and `x-admin-password` header
- No session management in serverless environment (stateless)

**Data Layer**
- Database abstraction through `IStorage` interface
- Drizzle ORM with Neon serverless PostgreSQL driver
- Schema-first approach with shared type definitions
- Support for filtering, pagination, and view count tracking

### Database Schema

**Core Tables**
- `users`: User authentication (id, username, password, isAdmin, createdAt)
- `leads`: Contact form submissions and leads management (id, name, email, businessNeeds, message, status, createdAt)
- `blog_categories`: Blog category management (id, name, slug, description, color, timestamps)
- `blog_posts`: Full-featured blog posts with SEO metadata, publishing status, featured flags, tags, and view tracking
- `blog_media`: Media files associated with blog posts

**Key Features**
- UUID primary keys with PostgreSQL `gen_random_uuid()`
- Automatic timestamp management (createdAt, updatedAt)
- Foreign key relationships (posts → categories, posts → users, media → posts)
- Support for draft/published workflow and featured content
- SEO-optimized fields (metaTitle, metaDescription, socialImage)

### External Dependencies

**Database**
- Neon Serverless PostgreSQL (specified in Drizzle config)
- Connection via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations and management

**Email Service**
- Resend for transactional email delivery
- Configuration: `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- Used for contact form submissions to sales@neuralcoderai.com

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui for pre-built component patterns
- Iconify React for extensive icon support
- React Country Flag for international elements

**Animation & Visualization**
- Framer Motion for complex animations and scroll effects
- React Intersection Observer for viewport-based triggers
- Custom scroll animations and parallax effects

**Deployment Platform**
- Vercel for serverless function hosting and static file serving
- Vercel Analytics integration for usage tracking
- Custom build configuration via `vercel.json`

**Development Tools**
- TypeScript for type safety across frontend and backend
- Vite plugins: React, runtime error overlay, Replit-specific tooling
- ESM module format throughout the codebase
- Cross-env for cross-platform environment variable handling