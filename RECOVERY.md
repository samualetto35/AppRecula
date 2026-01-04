# Recovery Guide for Existing Users

If you have users in `auth.users` but they don't have profiles/companies/memberships, here's how to recover:

## Option 1: Re-send Magic Link (Recommended)

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find the user who is missing profile data
3. Delete the user from the auth.users table
4. Have them register again using the registration form
5. They'll receive a new magic link that will create all the necessary records

## Option 2: Manual Database Fix (Advanced)

If you need to keep the existing user, you can manually create the missing records:

### Step 1: Get User ID
```sql
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

### Step 2: Create Profile
```sql
INSERT INTO profiles (id, email, full_name, job_title, created_at)
VALUES (
  'user-id-from-step-1',
  'user@example.com',
  'User Full Name',
  'Job Title',
  NOW()
);
```

### Step 3: Create Company
```sql
INSERT INTO companies (
  name,
  status,
  onboarding_completed,
  created_by_user_id,
  created_user_job_title,
  created_at,
  updated_at
)
VALUES (
  'Company Name',
  'active',
  false,
  'user-id-from-step-1',
  'Job Title',
  NOW(),
  NOW()
)
RETURNING id;
```

### Step 4: Create Membership
```sql
INSERT INTO memberships (
  user_id,
  company_id,
  role,
  status,
  created_at,
  updated_at
)
VALUES (
  'user-id-from-step-1',
  'company-id-from-step-3',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

## Option 3: Use the Fixed Callback

The callback handler is now fixed. If a user clicks their magic link again:
- It will check if profile exists
- If profile exists but no memberships, it will redirect appropriately
- If nothing exists, it will create everything (but you need the registration parameters in the URL)

**Note:** For users who already clicked the magic link but the callback failed, you'll need to either:
1. Delete them and have them re-register, OR
2. Manually create the missing records (Option 2)

## Prevention

The issue was caused by:
1. **Next.js 16 async searchParams**: Fixed by awaiting searchParams
2. **Missing RLS INSERT policies**: Fixed in migration 002

Make sure you've run both migrations to prevent this in the future.

