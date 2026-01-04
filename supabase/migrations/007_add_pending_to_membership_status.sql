-- Add 'pending' value to membership_status enum
-- This is needed for pending invitations before users log in

-- First, alter the enum type to add 'pending'
ALTER TYPE membership_status ADD VALUE IF NOT EXISTS 'pending';

-- Update the default value if needed (it's already 'active' which is fine)
-- No need to change default, 'active' is correct for direct registrations

