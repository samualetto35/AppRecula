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
  
  console.log(`🔍 getMemberships called for user: ${userId}`)
  
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching memberships:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return []
  }

  if (!data) {
    console.log('⚠️ No memberships data returned (null)')
    return []
  }

  console.log(`✅ Found ${data.length} memberships for user ${userId}`)
  
  if (data.length > 0) {
    console.log('Membership details:', data.map((m: any) => ({
      id: m.id,
      company_id: m.company_id,
      role: m.role,
      company: m.company ? { id: m.company.id, name: m.company.name, status: m.company.status } : null
    })))
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

export async function getPendingMembershipsByEmail(email: string): Promise<any[]> {
  const supabase = await createClient()
  
  console.log(`🔍 getPendingMembershipsByEmail called for: ${email}`)
  
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('email', email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching pending memberships:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return []
  }

  if (!data) {
    console.log('⚠️ No pending memberships data returned (null)')
    return []
  }

  console.log(`✅ Found ${data.length} pending memberships for ${email}`)
  
  if (data.length > 0) {
    console.log('Pending membership details:', data.map((m: any) => ({
      id: m.id,
      email: m.email,
      company_id: m.company_id,
      company: m.company ? { id: m.company.id, name: m.company.name } : null
    })))
  }

  // Don't filter out null companies - RLS blocks company access but membership is valid
  // UI will handle null company gracefully
  return data.map((m: any) => ({
    ...m,
    company: m.company || { id: m.company_id, name: null }, // Provide company_id even if company is null
  }))
}

export async function activatePendingMembership(userId: string, email: string) {
  const supabase = await createClient()
  
  // Find pending memberships for this email
  const { data: pendingMemberships, error: findError } = await supabase
    .from('memberships')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')

  if (findError || !pendingMemberships || pendingMemberships.length === 0) {
    return { success: false, error: 'No pending memberships found' }
  }

  // Activate all pending memberships for this user
  const { error: updateError } = await supabase
    .from('memberships')
    .update({
      user_id: userId,
      status: 'active',
    })
    .eq('email', email)
    .eq('status', 'pending')

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Update profile if it exists with NULL id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .is('id', null)
    .single()

  if (profile) {
    await supabase
      .from('profiles')
      .update({ id: userId })
      .eq('email', email)
      .is('id', null)
  } else {
    // Create profile if it doesn't exist
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          full_name: '', // Will be updated later
          job_title: '', // Will be updated later
        })
    }
  }

  return { success: true }
}

export async function requireDashboardAccess(userId: string, companyId?: string) {
  const user = await getUser()
  if (!user || user.id !== userId) {
    redirect('/login')
  }

  const memberships = await getActiveMemberships(userId)
  
  if (memberships.length === 0) {
    redirect('/setup')
  }

  if (companyId) {
    const membership = memberships.find((m) => m.company_id === companyId)
    if (!membership) {
      redirect('/select-company')
    }
    
    if (membership.company.status !== 'active') {
      redirect('/access-denied?reason=company_suspended')
    }
    
    return { user, membership, company: membership.company }
  }

  if (memberships.length === 1) {
    const membership = memberships[0]
    if (membership.company.status !== 'active') {
      redirect('/access-denied?reason=company_suspended')
    }
    return { user, membership, company: membership.company }
  }

  redirect('/select-company')
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

