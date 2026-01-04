import { createClient } from '@/lib/supabase/server'
import { requireAuth, getActiveMemberships } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this company
    const memberships = await getActiveMemberships(user.id)
    const userMembership = memberships.find((m) => m.company_id === companyId)

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Get all memberships for this company
    // Use left join to include pending memberships (no profile yet)
    console.log(`🔍 Fetching memberships for company ${companyId} by user ${user.id} (role: ${userMembership.role})`)
    
    const { data: allMemberships, error } = await supabase
      .from('memberships')
      .select(`
        id,
        user_id,
        email,
        full_name,
        role,
        status,
        created_at,
        profile:profiles(id, full_name, email, job_title)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching memberships:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log(`✅ Found ${allMemberships?.length || 0} memberships (before filtering)`)

    // Filter based on role
    let filteredMemberships = allMemberships || []
    if (userMembership.role !== 'admin') {
      // Non-admins can only see active memberships
      filteredMemberships = filteredMemberships.filter((m) => m.status === 'active')
    }

    return NextResponse.json({
      memberships: filteredMemberships,
    })
  } catch (error) {
    console.error('List memberships error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

