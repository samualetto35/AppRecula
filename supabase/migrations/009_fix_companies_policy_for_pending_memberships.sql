-- Fix companies SELECT policy to allow viewing companies for pending memberships
-- Note: We can't access auth.users.email in RLS, so we'll handle this in application layer
-- For now, we'll keep the existing policy and handle null companies in the app

-- The existing policy is sufficient - pending membership company access will be handled
-- in application code by checking email match before displaying

