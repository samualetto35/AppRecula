import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships, getCompany, getProfile } from '@/lib/auth/server'
import DashboardClient from './client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>
}) {
  const user = await requireAuth()
  const profile = await getProfile(user.id)
  const memberships = await getActiveMemberships(user.id)

  // Case A: No memberships
  if (memberships.length === 0) {
    redirect('/setup')
  }

  const params = await searchParams
  let companyId = params.companyId

  // Case B: Single membership - use it directly
  if (!companyId) {
    if (memberships.length === 1) {
      companyId = memberships[0].company_id
    } else {
      // Case C: Multiple memberships - redirect to selection
      redirect('/select-company')
    }
  }

  // Verify user has access to this company
  const membership = memberships.find((m) => m.company_id === companyId)
  if (!membership) {
    redirect('/select-company')
  }

  // Check company status
  if (membership.company.status !== 'active') {
    redirect('/access-denied?reason=company_suspended')
  }

  const company = await getCompany(companyId!)
  if (!company || company.status !== 'active') {
    redirect('/access-denied?reason=company_suspended')
  }

  return <DashboardClient company={company} userRole={membership.role} companyId={companyId!} userFullName={profile?.full_name || null} />
}

