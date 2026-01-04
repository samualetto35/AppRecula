import { redirect } from 'next/navigation'
import { requireAuth, getActiveMemberships } from '@/lib/auth/server'
import CompanySelectionClient from './client'

export default async function SelectCompanyPage() {
  const user = await requireAuth()
  const memberships = await getActiveMemberships(user.id)

  if (memberships.length === 0) {
    redirect('/register?error=no_memberships')
  }

  if (memberships.length === 1) {
    // Only one company, redirect to dashboard with that company
    redirect(`/dashboard?companyId=${memberships[0].company_id}`)
  }

  return <CompanySelectionClient memberships={memberships} />
}

