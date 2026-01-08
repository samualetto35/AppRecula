import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get origin from request URL or headers - ensure it's always a full URL with protocol
    const requestUrl = new URL(request.url)
    let origin = requestUrl.origin
    
    // Fallback to headers or env var if origin is not available
    if (!origin || origin === 'null') {
      const headerOrigin = request.headers.get('origin')?.trim()
      const headerHost = request.headers.get('host')?.trim()
      const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
      
      origin = headerOrigin || (headerHost ? `http://${headerHost}` : null) || envUrl || 'http://localhost:3000'
    }
    
    // Clean and validate origin
    origin = origin.trim()
    
    // Ensure protocol is present
    if (origin && !origin.startsWith('http://') && !origin.startsWith('https://')) {
      // If on production or has https in headers, use https, otherwise http
      const isHttps = request.headers.get('x-forwarded-proto') === 'https' || 
                      process.env.NODE_ENV === 'production' ||
                      origin.includes('netlify.app') ||
                      origin.includes('vercel.app')
      origin = `${isHttps ? 'https' : 'http'}://${origin}`
    }
    
    // Validate the URL is valid before using it
    try {
      new URL(origin)
    } catch (e) {
      console.error('❌ Invalid origin URL:', origin)
      origin = 'http://localhost:3000' // Safe fallback
    }
    
    // Send magic link for login - use /api/auth/callback (not /auth/callback)
    const callbackUrl = new URL('/api/auth/callback', origin)
    callbackUrl.searchParams.set('type', 'login')
    
    const callbackUrlString = callbackUrl.toString()
    console.log('📧 Login callback URL:', callbackUrlString)
    
    // Final validation - ensure no whitespace issues
    if (callbackUrlString.includes(' ') || callbackUrlString.trim() !== callbackUrlString) {
      console.error('❌ Callback URL contains whitespace! Fixing...')
      const fixedUrl = callbackUrlString.trim()
      console.log('✅ Fixed callback URL:', fixedUrl)
    }

    // Ensure callback URL is clean before sending to Supabase
    const cleanCallbackUrl = callbackUrl.toString().trim()
    
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: cleanCallbackUrl,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Check your email for the magic link',
      email,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

