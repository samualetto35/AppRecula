import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships, getCompany, getProfile } from '@/lib/auth/server'
import DashboardLayoutClient from './layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const profile = await getProfile(user.id)
  const memberships = await getActiveMemberships(user.id)

  if (memberships.length === 0) {
    redirect('/setup')
  }

  // Use first membership as default (will be overridden by page-level companyId from URL)
  let companyId = memberships[0].company_id

  if (memberships.length > 1) {
    // For multiple memberships, we'll use the first one as default
    // Pages will handle their own companyId from searchParams
    companyId = memberships[0].company_id
  }

  const membership = memberships.find((m) => m.company_id === companyId)
  if (!membership) {
    redirect('/select-company')
  }

  if (membership.company.status !== 'active') {
    redirect('/access-denied?reason=company_suspended')
  }

  const company = await getCompany(companyId!)
  if (!company || company.status !== 'active') {
    redirect('/access-denied?reason=company_suspended')
  }

  return (
    <DashboardLayoutClient
      company={company}
      userRole={membership.role}
      companyId={companyId!}
      userFullName={profile?.full_name || null}
    >
      {children}
    </DashboardLayoutClient>
  )
}

