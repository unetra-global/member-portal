import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // In local/dev environments where Supabase envs are not set,
  // return a minimal mock client so UI can render for preview.
  if (!url || !key) {
    const mockUser = { id: 'dev-mock', user_metadata: {} } as any
    const mockSubscription = { unsubscribe: () => {} }

    const mockAuth = {
      getSession: async () => ({ data: { session: { user: mockUser } }, error: null }),
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: mockSubscription } }),
      signOut: async () => ({ error: null }),
      // Methods used elsewhere can return informative errors when unconfigured
      signUp: async () => ({ data: {}, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: {}, error: new Error('Supabase not configured') }),
      updateUser: async () => ({ data: {}, error: new Error('Supabase not configured') }),
    } as any

    return { auth: mockAuth } as any
  }

  return createBrowserClient(url, key)
}