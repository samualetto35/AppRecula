-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE company_status AS ENUM ('active', 'suspended');
CREATE TYPE membership_role AS ENUM ('admin', 'recruiter', 'viewer');
CREATE TYPE membership_status AS ENUM ('active', 'revoked');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  country TEXT,
  sector TEXT,
  size_range TEXT,
  status company_status NOT NULL DEFAULT 'active',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_user_job_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table (many-to-many relationship)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  status membership_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_company_id ON memberships(company_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_created_by ON companies(created_by_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Companies: Users can view companies they are members of OR created
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

-- Companies: Admins can update their companies
CREATE POLICY "Admins can update their companies"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.company_id = companies.id
      AND memberships.user_id = auth.uid()
      AND memberships.role = 'admin'
      AND memberships.status = 'active'
    )
  );

-- Companies: Authenticated users can create companies (for registration)
CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = created_by_user_id);

-- Memberships: Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Memberships: Users can view memberships for their companies
-- NOTE: Removed this policy to avoid infinite recursion
-- Users can only view their own memberships via "Users can view own memberships" policy
-- If you need users to see other members in their company, implement a safer approach
-- that doesn't query memberships while evaluating memberships policies

-- Memberships: Users can insert their own memberships (for registration)
CREATE POLICY "Users can insert own memberships"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

