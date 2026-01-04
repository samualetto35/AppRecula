import { redirect } from 'next/navigation'
import { requireAuth, getPendingMembershipsByEmail } from '@/lib/auth/server'
import SetupClient from './client'

export default async function SetupPage() {
  const user = await requireAuth()
  
  // Check for pending memberships
  const pendingMemberships = await getPendingMembershipsByEmail(user.email!)

  return <SetupClient userEmail={user.email!} pendingMemberships={pendingMemberships} />
}

