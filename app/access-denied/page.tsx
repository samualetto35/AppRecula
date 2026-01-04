import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/server'
import AccessDeniedClient from './client'

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  await requireAuth()
  const params = await searchParams
  const reason = params.reason || 'unknown'

  return <AccessDeniedClient reason={reason} />
}

