export type CompanyStatus = 'active' | 'suspended'
export type MembershipRole = 'admin' | 'recruiter' | 'viewer'
export type MembershipStatus = 'active' | 'revoked'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  job_title: string
  created_at: string
}

export interface Company {
  id: string
  name: string
  website: string | null
  country: string | null
  sector: string | null
  size_range: string | null
  status: CompanyStatus
  onboarding_completed: boolean
  created_by_user_id: string
  created_user_job_title: string
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  user_id: string | null
  company_id: string
  role: MembershipRole
  status: MembershipStatus
  email: string | null
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface MembershipWithCompany extends Membership {
  company: Company
}

