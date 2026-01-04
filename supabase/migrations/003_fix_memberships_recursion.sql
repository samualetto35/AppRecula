-- Fix infinite recursion in memberships RLS policy
-- The "Users can view memberships in their companies" policy causes infinite recursion
-- because it queries memberships while being evaluated on memberships

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Users can view memberships in their companies" ON memberships;

-- Note: Users can still view their own memberships via the "Users can view own memberships" policy
-- If you need users to see other members in their company later, implement a safer approach
-- that checks the companies table instead of querying memberships recursively
