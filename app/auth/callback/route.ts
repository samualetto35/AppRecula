import { NextResponse } from 'next/server'

/**
 * This route handles Supabase auth callbacks when they use /auth/callback path
 * Redirects to /api/auth/callback which contains the actual logic
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  // Preserve all query parameters when redirecting
  const searchParams = requestUrl.searchParams.toString()
  const redirectUrl = new URL('/api/auth/callback', requestUrl.origin)
  
  if (searchParams) {
    redirectUrl.search = searchParams
  }
  
  console.log('🔄 Redirecting from /auth/callback to /api/auth/callback')
  return NextResponse.redirect(redirectUrl)
}

