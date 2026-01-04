import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { MembershipWithCompany } from '@/lib/types/database'

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  console.log('🔍 getUser() called - checking authentication...')
  const supabase = await createClient()
  
  // First check session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError)
  }
  
  console.log('Session exists:', !!session)
  if (session) {
    console.log('Session user ID:', session.user?.id)
  }
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('❌ User fetch error:', userError)
    console.error('Error message:', userError.message)
  }
  
  if (user) {
    console.log('✅ User found:', user.id, user.email)
  } else {
    console.log('❌ No user found')
  }
  
  return user
}

export async function requireAuth() {
  console.log('🔒 requireAuth() called')
  const user = await getUser()
  if (!user) {
    console.log('❌ No user in requireAuth, redirecting to login')
    redirect('/login')
  }
  console.log('✅ requireAuth passed, user:', user.id)
  return user
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }
  return data
}

export async function getMemberships(userId: string): Promise<MembershipWithCompany[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return []
  }

  return data.map((m: any) => ({
    ...m,
    company: m.company,
  })) as MembershipWithCompany[]
}

export async function getActiveMemberships(userId: string): Promise<MembershipWithCompany[]> {
  const memberships = await getMemberships(userId)
  return memberships.filter((m) => m.company.status === 'active')
}

export async function getCompany(companyId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    return null
  }
  return data
}

