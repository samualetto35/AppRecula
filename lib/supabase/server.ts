import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set!')
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!')
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  // Log first 20 chars of key for verification (safe to log)
  const keyPreview = supabaseAnonKey.substring(0, 20) + '...'
  console.log('🔧 Creating Supabase client with URL:', supabaseUrl)
  console.log('🔧 Anon key preview:', keyPreview)

  const cookieStore = await cookies()

  const client = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('🍪 Cookies retrieved:', allCookies.length, 'cookies')
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            console.log('🍪 Setting cookies:', cookiesToSet.length, 'cookies')
            cookiesToSet.forEach(({ name, value, options }) => {
              // Make auth cookies persistent (remember session even after browser closes)
              // Supabase auth cookies typically start with 'sb-' or 'supabase.auth.token'
              const isAuthCookie = name.startsWith('sb-') || name.includes('auth-token')
              
              if (isAuthCookie && value) {
                // Set persistent cookie: 30 days expiration
                // maxAge is in seconds: 30 days = 30 * 24 * 60 * 60 = 2,592,000 seconds
                const maxAge = 30 * 24 * 60 * 60 // 30 days
                
                cookieStore.set(name, value, {
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
                cookieStore.set(name, value, options)
              }
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn('⚠️  Cookie setAll error (this is usually OK):', error)
          }
        },
      },
    }
  )

  console.log('✅ Supabase client created successfully')
  return client
}

