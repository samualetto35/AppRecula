import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships, getCompany } from '@/lib/auth/server'
import JobDetailClient from './client'

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>
  searchParams: Promise<{ companyId?: string; tab?: string }>
}) {
  const user = await requireAuth()
  const memberships = await getActiveMemberships(user.id)

  if (memberships.length === 0) {
    redirect('/setup')
  }

  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  let companyId = resolvedSearchParams.companyId

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

  return (
    <JobDetailClient
      jobId={resolvedParams.jobId}
      companyId={companyId!}
      userRole={membership.role}
      initialTab={resolvedSearchParams.tab || 'overview'}
    />
  )
}

