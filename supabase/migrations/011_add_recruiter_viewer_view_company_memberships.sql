-- Allow recruiters and viewers to view all active memberships in their companies
-- This is needed for team members list on dashboard
-- We use companies table to avoid recursion (checking membership via company, not membership)

-- Create a function to check if user is a member (any role) of a company
-- SECURITY DEFINER allows the function to bypass RLS when checking membership
CREATE OR REPLACE FUNCTION is_company_member(company_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships
    WHERE company_id = company_uuid
    AND user_id = user_uuid
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing "Users can view own memberships" policy to include company members
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;

CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (
    -- User can view their own active memberships
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Admins can view all memberships in their companies (using function to avoid recursion)
    is_company_admin(company_id, auth.uid())
    OR
    -- Recruiters and viewers can view all active memberships in their companies
    (is_company_member(company_id, auth.uid()) AND status = 'active')
  );

-- Keep the pending memberships policy separate
-- (Already exists from migration 006)

