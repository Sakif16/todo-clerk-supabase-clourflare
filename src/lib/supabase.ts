import { createClient } from '@supabase/supabase-js'

// Call this wherever you need to query Supabase
// Pass the Clerk session's getToken function so each request is authenticated
export function createSupabaseClient(getToken: () => Promise<string | null>) {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => getToken(),
    }
  )
}