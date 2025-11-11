import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Check if user has completed their profile
    if (user.user_metadata?.profile_completed) {
      redirect('/dashboard')
    } else {
      redirect('/profile/complete')
    }
  } else {
    redirect('/login')
  }
}
