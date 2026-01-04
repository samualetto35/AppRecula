# Troubleshooting Guide

## Environment Variables

### ⚠️ IMPORTANT: Use the ANON KEY, NOT the SECRET KEY

**You MUST use the `anon` key (also called "publishable key"), NOT the `service_role` key (secret key).**

- ✅ **CORRECT**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your **anon/publishable** key
- ❌ **WRONG**: Using the `service_role` secret key

**Where to find your anon key:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Under **Project API keys**, find the **`anon` `public`** key
4. This is the key that starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Why?**
- The anon key is safe to expose in client-side code (it's in `NEXT_PUBLIC_`)
- The secret key has admin privileges and should NEVER be exposed
- Using the secret key can cause authentication issues and security vulnerabilities

## Common Issues

### 1. Database Tables Not Being Populated

**Symptoms:**
- Magic link emails are sent
- User clicks the link
- No data appears in `profiles`, `companies`, or `memberships` tables

**Possible Causes & Solutions:**

#### A. RLS (Row Level Security) Policies Blocking Inserts

**Check:**
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Verify RLS is enabled on `profiles`, `companies`, and `memberships` tables
3. Check if there are policies that might block inserts

**Solution:**
The migration file should have set up RLS correctly. If inserts are failing, you may need to temporarily disable RLS or adjust policies:

```sql
-- Check current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- If RLS is blocking, you can temporarily check policies:
SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'companies', 'memberships');
```

#### B. User Already Exists in auth.users

**Check:**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. See if the user email exists

**Solution:**
The callback handler now checks if a profile exists before creating one. If a user exists but has no profile, try:
1. Delete the user from Authentication → Users
2. Try registration again

#### C. Check Server Logs

**Check browser console and server logs for errors:**
- Open browser DevTools → Console
- Check terminal where `npm run dev` is running
- Look for error messages about profile/company/membership creation

### 2. Magic Link Redirects Back to Login

**Symptoms:**
- Click magic link
- Redirected to login page instead of dashboard

**Possible Causes & Solutions:**

#### A. Session Not Established

**Check:**
1. Verify the callback URL is correct in Supabase settings
2. Check if `exchangeCodeForSession` is working

**Solution:**
The updated callback handler now properly handles session exchange and checks for errors.

#### B. User Has No Memberships

**Check:**
1. If user exists in `auth.users` but has no profile/memberships
2. User will be redirected to registration

**Solution:**
Complete the registration flow to create profile, company, and membership.

#### C. Callback URL Not Configured

**Check:**
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Ensure these URLs are added:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 3. Email Confirmation vs Magic Link

**Understanding the difference:**
- **Email Confirmation**: Sent when a new user signs up (if email confirmation is enabled)
- **Magic Link**: The actual login/registration link

**If you're getting both:**
- This is normal if email confirmation is enabled in Supabase
- The magic link is the one you need to click
- The confirmation email is just a notification

**To disable email confirmation (optional):**
1. Supabase Dashboard → **Authentication** → **Settings**
2. Disable "Enable email confirmations"

## Debugging Steps

### 1. Check Database Tables

```sql
-- Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users;

-- Check profiles
SELECT * FROM profiles;

-- Check companies
SELECT * FROM companies;

-- Check memberships
SELECT * FROM memberships;
```

### 2. Check Authentication Flow

1. Submit registration/login form
2. Check email for magic link
3. Click magic link
4. Check browser console for errors
5. Check server terminal for errors
6. Verify data in Supabase dashboard

### 3. Test with Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Manually create a test user
3. Then create profile/company/membership manually
4. Try logging in with that user

### 4. Enable Detailed Logging

Add console.logs in the callback handler to see what's happening:

```typescript
console.log('Code:', code)
console.log('Type:', type)
console.log('User:', user)
console.log('Profile Error:', profileError)
```

## Still Having Issues?

1. **Check Supabase Logs:**
   - Dashboard → **Logs** → **Postgres Logs**
   - Look for SQL errors

2. **Verify Migration Ran:**
   - Check if all tables exist
   - Verify RLS policies are set up

3. **Test in Incognito Mode:**
   - Clear cookies and try again
   - Sometimes browser cache can cause issues

4. **Check Network Tab:**
   - Open DevTools → Network
   - See if API calls are failing
   - Check response status codes

