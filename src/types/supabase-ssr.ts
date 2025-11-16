// Ambient type declarations for '@supabase/ssr' to satisfy TypeScript.
// These provide minimal typings used in this project for server and browser clients.
declare module '@supabase/ssr' {
  import type { SupabaseClient } from '@supabase/supabase-js'

  type CookieOption = {
    name: string
    value: string
    options?: Record<string, unknown>
  }

  interface SSRClientOptions {
    cookies: {
      getAll: () => CookieOption[]
      setAll: (cookiesToSet: CookieOption[]) => void
    }
  }

  export function createServerClient(
    url: string,
    key: string,
    options?: SSRClientOptions
  ): SupabaseClient

  export function createBrowserClient(url: string, key: string): SupabaseClient
}