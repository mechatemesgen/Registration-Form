import { createClient } from "@supabase/supabase-js"

// This client uses the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
export function createAdminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

