-- Add full_name column to memberships table for pending invitations
-- This allows storing the invited user's name before they log in

ALTER TABLE memberships
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add comment
COMMENT ON COLUMN memberships.full_name IS 'Full name for pending invitations. Will be used when creating profile on first login.';

