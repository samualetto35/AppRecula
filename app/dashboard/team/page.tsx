import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships, getCompany } from '@/lib/auth/server'
import TeamManagementClient from './client'

export default async function TeamManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>
}) {
  const user = await requireAuth()
  const params = await searchParams
  const companyId = params.companyId

  if (!companyId) {
    // No companyId provided, redirect to dashboard
    redirect('/dashboard')
  }

  // Get memberships to verify admin access
  const memberships = await getActiveMemberships(user.id)

  if (memberships.length === 0) {
    // No memberships - this shouldn't happen if user can access dashboard
    // But if it does, redirect to setup
    redirect('/setup')
  }

  const membership = memberships.find((m) => m.company_id === companyId)
  
  if (!membership) {
    // User doesn't have access to this company
    // Redirect to their first company's dashboard
    if (memberships.length > 0) {
      redirect(`/dashboard?companyId=${memberships[0].company_id}`)
    } else {
      redirect('/setup')
    }
  }
  
  if (membership.role !== 'admin') {
    // Not admin, redirect to dashboard
    redirect(`/dashboard?companyId=${companyId}`)
  }

  const company = await getCompany(companyId)
  if (!company || company.status !== 'active') {
    redirect('/dashboard')
  }

  return <TeamManagementClient company={company} />
}

