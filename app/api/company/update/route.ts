import { createClient } from '@/lib/supabase/server'
import { requireAuth, getActiveMemberships } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { companyId, country, sector, sizeRange } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Verify user has admin access to this company
    const memberships = await getActiveMemberships(user.id)
    const membership = memberships.find((m) => m.company_id === companyId && m.role === 'admin')

    if (!membership) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Update company
    const { data, error } = await supabase
      .from('companies')
      .update({
        country: country || null,
        sector: sector || null,
        size_range: sizeRange || null,
        onboarding_completed: true,
      })
      .eq('id', companyId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ company: data })
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

