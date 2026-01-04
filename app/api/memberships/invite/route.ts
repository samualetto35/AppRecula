import { createClient } from '@/lib/supabase/server'
import { requireAuth, getActiveMemberships } from '@/lib/auth/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { email, fullName, role, companyId } = body

    // Validate required fields
    if (!email || !role || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, companyId' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['admin', 'recruiter', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, recruiter, or viewer' },
        { status: 400 }
      )
    }

    // Verify user is admin of the company
    const memberships = await getActiveMemberships(user.id)
    const membership = memberships.find((m) => m.company_id === companyId && m.role === 'admin')

    if (!membership) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be an admin of this company' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Check if membership already exists for this email and company
    // Only check by email, not by user_id (admin might be inviting a different user)
    const { data: existingMemberships, error: checkError } = await supabase
      .from('memberships')
      .select('id, status, user_id, email')
      .eq('company_id', companyId)
      .eq('email', email)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing memberships:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing memberships' },
        { status: 500 }
      )
    }

    const existingMembership = existingMemberships && existingMemberships.length > 0 ? existingMemberships[0] : null

    if (existingMembership) {
      // If user_id exists and status is active, they're already an active member
      if (existingMembership.user_id && existingMembership.status === 'active') {
        return NextResponse.json(
          { error: 'User is already a member of this company' },
          { status: 400 }
        )
      }
      
      // If pending, update the role (allow re-inviting with different role)
      if (existingMembership.status === 'pending') {
        const { error: updateError } = await supabase
          .from('memberships')
          .update({ role })
          .eq('id', existingMembership.id)

        if (updateError) {
          console.error('Error updating pending membership:', updateError)
          return NextResponse.json(
            { error: updateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({
          message: 'Invitation updated',
          membership: { id: existingMembership.id, email, role, status: 'pending' },
        })
      }
      
      // If revoked, allow re-inviting by deleting old membership
      if (existingMembership.status === 'revoked') {
        await supabase
          .from('memberships')
          .delete()
          .eq('id', existingMembership.id)
        // Continue to create new pending membership below
      }
    }

    // Create pending membership
    const { data: newMembership, error: insertError } = await supabase
      .from('memberships')
      .insert({
        company_id: companyId,
        email,
        full_name: fullName || null, // Store full name for pending invitations
        role,
        status: 'pending',
        user_id: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Membership creation error:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'User invited successfully',
      membership: newMembership,
    })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

