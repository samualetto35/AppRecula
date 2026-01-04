import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships, getCompany } from '@/lib/auth/server'
import DashboardClient from './client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>
}) {
  console.log('📊 Dashboard page loading...')
  const user = await requireAuth()
  console.log('📊 Dashboard - User authenticated:', user.id)
  const memberships = await getActiveMemberships(user.id)
  console.log('📊 Dashboard - Memberships found:', memberships.length)

  if (memberships.length === 0) {
    redirect('/register?error=no_memberships')
  }

  const params = await searchParams
  let companyId = params.companyId

  // If no company selected, use the first one or redirect to selection
  if (!companyId) {
    if (memberships.length === 1) {
      companyId = memberships[0].company_id
    } else {
      redirect('/select-company')
    }
  }

  // Verify user has access to this company
  const membership = memberships.find((m) => m.company_id === companyId)
  if (!membership) {
    redirect('/select-company')
  }

  const company = await getCompany(companyId!)
  if (!company) {
    redirect('/select-company')
  }

  return <DashboardClient company={company} userRole={membership.role} />
}

