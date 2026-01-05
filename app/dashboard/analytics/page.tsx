import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships, getCompany } from '@/lib/auth/server'
import AnalyticsClient from './client'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>
}) {
  const user = await requireAuth()
  const memberships = await getActiveMemberships(user.id)

  if (memberships.length === 0) {
    redirect('/setup')
  }

  const params = await searchParams
  let companyId = params.companyId

  if (!companyId) {
    if (memberships.length === 1) {
      companyId = memberships[0].company_id
    } else {
      redirect('/select-company')
    }
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

  return <AnalyticsClient companyId={companyId!} userRole={membership.role} />
}

