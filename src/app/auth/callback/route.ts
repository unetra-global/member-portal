import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has completed their profile
      const { data: { user } } = await supabase.auth.getUser()
      let redirectPath = next

      if (user && !user.user_metadata?.profile_completed) {
        redirectPath = '/profile/complete'
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const basePath = '/member-portal'

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${basePath}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${basePath}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${basePath}${redirectPath}`)
      }
    }
    // If there was an error during the exchange, log it and redirect to an error page
    if (error) {
      console.error('Supabase OAuth exchange error:', error)
      const errorMsg = encodeURIComponent(error.message || 'OAuth error')
      const basePath = '/member-portal'
      return NextResponse.redirect(`${origin}${basePath}/auth/auth-code-error?msg=${errorMsg}`)
    }
  }

  // return the user to an error page with instructions
  const basePath = '/member-portal'
  return NextResponse.redirect(`${origin}${basePath}/auth/auth-code-error`)
}