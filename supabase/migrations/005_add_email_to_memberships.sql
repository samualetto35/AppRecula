-- Add email column to memberships table for pending invitations
-- This allows creating memberships before the user has an auth account

-- Make user_id nullable for pending memberships
ALTER TABLE memberships
ALTER COLUMN user_id DROP NOT NULL;

-- Add email column
ALTER TABLE memberships
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_memberships_email ON memberships(email);

-- Update existing memberships to have email from profiles
UPDATE memberships m
SET email = p.email
FROM profiles p
WHERE m.user_id = p.id
AND m.email IS NULL;

-- Drop the old unique constraint (it's a constraint, not just an index)
ALTER TABLE memberships
DROP CONSTRAINT IF EXISTS memberships_user_id_company_id_key;

-- Create partial unique index for active memberships
CREATE UNIQUE INDEX memberships_user_company_active_unique 
ON memberships(user_id, company_id) 
WHERE user_id IS NOT NULL AND status = 'active';

-- Add comment
COMMENT ON COLUMN memberships.email IS 'Email address for pending invitations. Once user_id is set, this can be used for lookup but user_id is authoritative.';
COMMENT ON COLUMN memberships.user_id IS 'NULL for pending invitations. Set when user accepts invitation and logs in.';

