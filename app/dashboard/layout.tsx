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

  // Use first membership as default
  // Layout-client will handle companyId from URL searchParams and update role accordingly
  let companyId = memberships[0].company_id

  // If multiple memberships, redirect to select-company (unless URL has companyId)
  if (memberships.length > 1) {
    // Let client component handle URL-based companyId selection
    // For now, use first one as fallback
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

  // Pass all memberships so client can select correct one based on URL
  return (
    <DashboardLayoutClient
      company={company}
      userRole={membership.role}
      companyId={companyId!}
      userFullName={profile?.full_name || null}
      allMemberships={memberships}
    >
      {children}
    </DashboardLayoutClient>
  )
}

