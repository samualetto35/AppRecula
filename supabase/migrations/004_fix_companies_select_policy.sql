-- Fix companies SELECT policy to allow users to view companies they created
-- This is needed during registration when company is created before membership

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view companies they belong to" ON companies;

-- Create updated policy that allows viewing companies you created OR are a member of
CREATE POLICY "Users can view companies they belong to"
  ON companies FOR SELECT
  USING (
    -- User is a member of the company
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.company_id = companies.id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
    OR
    -- User created the company (needed during registration before membership is created)
    created_by_user_id = auth.uid()
  );

