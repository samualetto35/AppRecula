import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Make auth cookies persistent (remember session even after browser closes)
            // Supabase auth cookies typically start with 'sb-' or 'supabase.auth.token'
            const isAuthCookie = name.startsWith('sb-') || name.includes('auth-token')
            
            if (isAuthCookie && value) {
              // Set persistent cookie: 30 days expiration
              // maxAge is in seconds: 30 days = 30 * 24 * 60 * 60 = 2,592,000 seconds
              const maxAge = 30 * 24 * 60 * 60 // 30 days
              
              supabaseResponse.cookies.set(name, value, {
                ...options,
                maxAge,
                // Ensure cookie persists across browser sessions
                httpOnly: true,
                sameSite: 'lax' as const,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
              })
            } else {
              // For other cookies, use default options
              supabaseResponse.cookies.set(name, value, options)
            }
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}

