import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('=== AUTH CALLBACK ROUTE HANDLER STARTED ===')
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  console.log('📋 Query params:', {
    code: !!code,
    type,
    email: requestUrl.searchParams.get('email'),
    fullName: requestUrl.searchParams.get('fullName'),
    jobTitle: requestUrl.searchParams.get('jobTitle'),
    companyName: requestUrl.searchParams.get('companyName'),
  })

  if (!code) {
    console.log('⚠️  No code in URL, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createClient()

  console.log('🔄 Exchanging code for session...')
  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('❌ Session exchange error:', exchangeError)
    return NextResponse.redirect(new URL('/login?error=session_exchange_failed', request.url))
  }

  console.log('✅ Code exchanged for session successfully')
  console.log('Session user ID:', exchangeData.session?.user?.id)

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('❌ User fetch error:', userError)
    return NextResponse.redirect(new URL('/login?error=user_fetch_failed', request.url))
  }

  console.log('✅ User authenticated:', user.id, user.email)

  // Handle registration flow
  if (type === 'register') {
    console.log('📝 REGISTRATION FLOW STARTED')
    const email = requestUrl.searchParams.get('email')
    const fullName = requestUrl.searchParams.get('fullName')
    const jobTitle = requestUrl.searchParams.get('jobTitle')
    const companyName = requestUrl.searchParams.get('companyName')
    const companyWebsite = requestUrl.searchParams.get('companyWebsite')
    const phone = requestUrl.searchParams.get('phone')

    if (!email || !fullName || !jobTitle || !companyName) {
      console.error('❌ Missing registration parameters')
      return NextResponse.redirect(new URL('/register?error=missing_parameters', request.url))
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      console.log('⚠️  Profile already exists, checking memberships...')
      const { data: memberships } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)

      if (memberships && memberships.length > 0) {
        console.log('✅ User already registered, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        console.error('❌ Profile exists but no memberships')
        return NextResponse.redirect(new URL('/register?error=profile_exists_no_membership', request.url))
      }
    }

    // Create profile
    console.log('📝 STEP 1: Creating profile...')
    const { error: profileError, data: profileData } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email,
        full_name: fullName,
        job_title: jobTitle,
        phone: phone || null,
      })
      .select()

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      if (profileError.code !== '23505') {
        return NextResponse.redirect(
          new URL(`/register?error=profile_creation_failed&details=${encodeURIComponent(profileError.message)}`, request.url)
        )
      }
      console.log('⚠️  Profile already exists (duplicate), continuing...')
    } else {
      console.log('✅ Profile created successfully')
    }

    // Create company
    console.log('📝 STEP 2: Creating company...')
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: companyName,
        website: companyWebsite || null,
        status: 'active',
        onboarding_completed: false,
        created_by_user_id: user.id,
        created_user_job_title: jobTitle,
      })
      .select()
      .single()

    if (companyError || !company) {
      console.error('❌ Company creation error:', companyError)
      return NextResponse.redirect(
        new URL(`/register?error=company_creation_failed&details=${encodeURIComponent(companyError?.message || 'Unknown error')}`, request.url)
      )
    }
    console.log('✅ Company created successfully:', company.id)

    // Create membership
    console.log('📝 STEP 3: Creating membership...')
    const { error: membershipError } = await supabase.from('memberships').insert({
      user_id: user.id,
      company_id: company.id,
      role: 'admin',
      status: 'active',
    })

    if (membershipError) {
      console.error('❌ Membership creation error:', membershipError)
      if (membershipError.code !== '23505') {
        return NextResponse.redirect(
          new URL(`/register?error=membership_creation_failed&details=${encodeURIComponent(membershipError.message)}`, request.url)
        )
      }
      console.log('⚠️  Membership already exists, continuing...')
    } else {
      console.log('✅ Membership created successfully')
    }

    console.log('✅✅✅ REGISTRATION COMPLETE ✅✅✅')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Handle login flow
  console.log('🔐 LOGIN FLOW')
  
  // First, check for pending memberships by email and activate them
  const { data: pendingMemberships, error: pendingError } = await supabase
    .from('memberships')
    .select('id, company_id, email, role, full_name')
    .eq('email', user.email!)
    .eq('status', 'pending')

  if (pendingError) {
    console.error('❌ Error checking pending memberships:', pendingError)
  } else {
    console.log(`🔍 Found ${pendingMemberships?.length || 0} pending memberships`)
  }

  if (pendingMemberships && pendingMemberships.length > 0) {
    console.log(`🔄 Found ${pendingMemberships.length} pending membership(s), activating...`)
    
    // Activate each pending membership
    for (const pending of pendingMemberships) {
      console.log(`🔄 Activating membership ${pending.id} for user ${user.id}`)
      
      const { data: updatedMembership, error: activateError } = await supabase
        .from('memberships')
        .update({
          user_id: user.id,
          status: 'active',
        })
        .eq('id', pending.id)
        .eq('status', 'pending')
        .select()
        .single()

      if (activateError) {
        console.error(`❌ Error activating membership ${pending.id}:`, activateError)
        console.error('Error details:', JSON.stringify(activateError, null, 2))
      } else {
        console.log(`✅ Activated membership ${pending.id} for company ${pending.company_id}`)
        console.log('Updated membership:', {
          id: updatedMembership?.id,
          user_id: updatedMembership?.user_id,
          status: updatedMembership?.status
        })
      }
    }

    // Create profile if it doesn't exist
    // Use full_name from the first pending membership if available
    const firstPending = pendingMemberships[0]
    const fullNameFromInvite = firstPending?.full_name || user.user_metadata?.full_name || ''
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: fullNameFromInvite,
          job_title: '',
        })

      if (profileError) {
        console.error('❌ Error creating profile:', profileError)
      } else {
        console.log('✅ Profile created with name:', fullNameFromInvite)
      }
    }
  }

  // Now check for active memberships
  console.log(`🔍 Checking for active memberships for user ${user.id}`)
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select(`
      id,
      company_id,
      company:companies(id, status, name)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (membershipsError) {
    console.error('❌ Error fetching active memberships:', membershipsError)
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  if (!memberships || memberships.length === 0) {
    console.log('❌ No active memberships found for user:', user.id)
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  console.log(`✅ Found ${memberships.length} active membership(s)`)

  // Filter only active companies
  const activeMemberships = memberships.filter((m: any) => m.company?.status === 'active')

  if (activeMemberships.length === 0) {
    console.log('❌ No active company memberships')
    return NextResponse.redirect(new URL('/access-denied?reason=company_suspended', request.url))
  }

  console.log(`✅ User has ${activeMemberships.length} active membership(s)`)
  
  if (activeMemberships.length === 1) {
    return NextResponse.redirect(new URL(`/dashboard?companyId=${activeMemberships[0].company_id}`, request.url))
  }

  return NextResponse.redirect(new URL('/select-company', request.url))
}

