-- Allow admins to view all memberships in their companies
-- This is needed for team management page
-- We use a PostgreSQL function with SECURITY DEFINER to avoid infinite recursion

-- First, drop the problematic policy if it exists
DROP POLICY IF EXISTS "Admins can view memberships in their companies" ON memberships;

-- Create a function to check if user is admin of a company
-- SECURITY DEFINER allows the function to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION is_company_admin(company_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE company_id = company_uuid
    AND user_id = user_uuid
    AND role = 'admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now update the existing "Users can view own memberships" policy to include admin access
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;

CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (
    -- User can view their own active memberships
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Admins can view all memberships in their companies (using function to avoid recursion)
    is_company_admin(company_id, auth.uid())
  );

-- Keep the pending memberships policy separate
-- (Already exists from migration 006, but ensure it's there)

