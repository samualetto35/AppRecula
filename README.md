# B2B SaaS Platform

A modern B2B SaaS application with organization-based authentication using Supabase.

## Features

- **Passwordless Authentication**: Magic link email authentication via Supabase
- **Organization-Based Access**: Multi-company support with role-based memberships
- **Server-Authoritative**: All critical logic runs server-side
- **Onboarding Flow**: Guided company onboarding with optional fields

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Supabase** (Auth + Postgres)
- **Tailwind CSS**

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and **anon key** (NOT the secret key!)
   - Go to **Settings** → **API**
   - Find the **`anon` `public`** key (this is safe to use in client-side code)
   - ⚠️ **DO NOT use the `service_role` secret key** - it should never be exposed
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Use the **anon/publishable key**, not the secret key. The anon key is safe to expose in client-side code.

### 3. Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`

This will create:
- `profiles` table
- `companies` table
- `memberships` table
- Row Level Security (RLS) policies
- Indexes and triggers

### 4. Configure Supabase Auth

1. In Supabase Dashboard → Authentication → URL Configuration
2. Add your redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Profiles
- Extends `auth.users`
- Stores user profile information

### Companies
- Organization/company records
- Tracks onboarding status
- Supports suspension

### Memberships
- Many-to-many relationship between users and companies
- Role-based access (admin, recruiter, viewer)
- Status tracking (active, revoked)

## Authentication Flows

### Registration
1. User fills registration form (name, email, job title, company name)
2. Magic link sent to email
3. On confirmation:
   - Profile created
   - Company created
   - Admin membership created

### Login
1. User enters email
2. Magic link sent
3. On confirmation, user redirected to dashboard
4. If multiple companies, company selection screen shown

### Post-Login
- Dashboard displays company information
- If onboarding incomplete, modal appears
- User can complete or skip onboarding

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Auth callback handler
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── select-company/   # Company selection
├── lib/
│   ├── auth/             # Auth utilities
│   ├── supabase/         # Supabase clients
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Database migrations
└── middleware.ts         # Next.js middleware
```

## Security

- All authentication handled by Supabase
- Row Level Security (RLS) enabled on all tables
- Server-side validation for all critical operations
- No client-side mock state or localStorage for auth

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Environment Variables

Required environment variables (see `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Notes

- Email verification is handled by Supabase magic links
- Company suspension blocks all access regardless of membership
- Users without memberships are redirected to registration
- All company creation and membership logic runs server-side
