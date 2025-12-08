import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MemberRepository } from '@/server/repositories/memberRepository'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Read mode from cookie (set before OAuth redirect)
  const modeCookie = request.cookies.get('oauth_mode');
  const mode = modeCookie?.value || 'signin';

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has completed their profile
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (user.email) {
          const memberRepo = new MemberRepository();

          // Check if this user already has a member profile
          const userMember = await memberRepo.findByUserId(user.id);

          // If mode is 'signup' but user already has a member profile, block it
          if (mode === 'signup' && userMember) {
            await supabase.auth.signOut();

            const basePath = '/member-portal';
            const errorMsg = encodeURIComponent('You already have an account. Please use Sign In instead.');
            return NextResponse.redirect(`${origin}${basePath}/login?error=${errorMsg}`);
          }

          if (!userMember) {
            // No member profile for this user_id, so this is a sign-up
            // Check if email already exists with a different user_id
            const existingMember = await memberRepo.findByEmail(user.email);
            console.log("Existing Member (by email):", existingMember ? `EXISTS (user_id: ${existingMember.user_id})` : "NULL");

            if (existingMember && existingMember.user_id !== user.id) {
              // Email already registered with a different account - sign out and show error
              console.log("DUPLICATE EMAIL DETECTED - Blocking signup");
              await supabase.auth.signOut();

              const basePath = '/member-portal';
              const errorMsg = encodeURIComponent('This email is already registered. Please sign in with your existing account.');
              return NextResponse.redirect(`${origin}${basePath}/login?error=${errorMsg}`);
            }
          }
          // If userMember exists and mode is signin, allow it to proceed
          console.log("Proceeding with OAuth callback");
        }
      }

      let redirectPath = next

      if (user && !user.user_metadata?.profile_completed) {
        redirectPath = '/profile/complete'
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const basePath = '/member-portal'

      // Clear the oauth_mode cookie
      const response = isLocalEnv
        ? NextResponse.redirect(`${origin}${basePath}${redirectPath}`)
        : forwardedHost
          ? NextResponse.redirect(`https://${forwardedHost}${basePath}${redirectPath}`)
          : NextResponse.redirect(`${origin}${basePath}${redirectPath}`);

      response.cookies.delete('oauth_mode');
      return response;
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