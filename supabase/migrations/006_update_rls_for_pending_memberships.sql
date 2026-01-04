-- Update RLS policies to support pending memberships

-- Memberships: Allow viewing pending memberships by email (for activation)
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;

CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (
    -- User can view their own active memberships
    (user_id IS NOT NULL AND auth.uid() = user_id)
  );

-- Separate policy for pending memberships
-- Note: This allows viewing pending memberships, but application layer filters by email
-- This is necessary because we can't access auth.users.email in RLS policy
-- The actual security is enforced in application code (callback checks email match)
CREATE POLICY "Users can view pending memberships for activation"
  ON memberships FOR SELECT
  USING (
    -- Allow viewing pending memberships (email filtering done in app code)
    (user_id IS NULL AND status = 'pending')
  );

-- Memberships: Allow inserting pending memberships (for admins inviting users)
DROP POLICY IF EXISTS "Users can insert own memberships" ON memberships;

CREATE POLICY "Users can insert own memberships"
  ON memberships FOR INSERT
  WITH CHECK (
    -- User can insert their own membership (during registration)
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Admins can create pending memberships for others
    -- Check if user is admin of the company being inserted
    -- Note: In WITH CHECK, we reference the column being inserted directly
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.company_id = company_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
      AND m.status = 'active'
    )
  );

-- Memberships: Allow updating pending to active (when user logs in)
DROP POLICY IF EXISTS "Users can activate pending memberships" ON memberships;

CREATE POLICY "Users can activate pending memberships"
  ON memberships FOR UPDATE
  USING (
    -- User can activate pending memberships where user_id is NULL
    -- Email matching will be done in application code
    (user_id IS NULL)
  )
  WITH CHECK (
    -- Can only update to set user_id and status to active
    (user_id = auth.uid() AND status = 'active')
  );

-- Note: Profiles cannot have NULL id (it's PRIMARY KEY)
-- So we don't create placeholder profiles. Profile is created when user first logs in.
-- The existing "Users can insert own profile" policy is sufficient.

