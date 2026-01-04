-- Add missing INSERT policies for RLS
-- Run this if you already ran 001_initial_schema.sql

-- Profiles: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Companies: Authenticated users can create companies (for registration)
CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = created_by_user_id);

-- Memberships: Users can insert their own memberships (for registration)
CREATE POLICY "Users can insert own memberships"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

