import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('=== REGISTRATION API CALLED ===')
  try {
    const body = await request.json()
    console.log('Registration request body:', JSON.stringify(body, null, 2))
    
    const { email, fullName, jobTitle, companyName, companyWebsite, phone } = body
    console.log('Extracted fields:', { email, fullName, jobTitle, companyName, companyWebsite, phone })

    // Validate required fields
    if (!email || !fullName || !jobTitle || !companyName) {
      console.error('❌ Missing required fields:', { email: !!email, fullName: !!fullName, jobTitle: !!jobTitle, companyName: !!companyName })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('✅ All required fields present')
    console.log('Creating Supabase client...')
    const supabase = await createClient()
    console.log('✅ Supabase client created')

    // Send magic link for registration
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    console.log('Origin:', origin)
    
    const callbackUrl = new URL('/api/auth/callback', origin)
    callbackUrl.searchParams.set('type', 'register')
    callbackUrl.searchParams.set('email', email)
    callbackUrl.searchParams.set('fullName', fullName)
    callbackUrl.searchParams.set('jobTitle', jobTitle)
    callbackUrl.searchParams.set('companyName', companyName)
    if (companyWebsite) callbackUrl.searchParams.set('companyWebsite', companyWebsite)
    if (phone) callbackUrl.searchParams.set('phone', phone)

    console.log('📧 Callback URL:', callbackUrl.toString())
    console.log('Sending magic link to:', email)

    const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    })

    if (authError) {
      console.error('❌ Auth error sending magic link:', authError)
      console.error('Error code:', authError.status)
      console.error('Error message:', authError.message)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    console.log('✅ Magic link sent successfully')
    console.log('Auth data:', authData)
    console.log('=== REGISTRATION API COMPLETE ===')
    console.log('⚠️  NOTE: User will be created in auth.users when they click the magic link')
    console.log('⚠️  NOTE: Profile/Company/Membership will be created in the callback handler')

    return NextResponse.json({
      message: 'Check your email for the magic link',
      email,
    })
  } catch (error) {
    console.error('❌ Registration error (catch block):', error)
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}

