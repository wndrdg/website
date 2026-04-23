import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client (uses anon key for auth flows).
// CRM data queries should go through Server Components with the service role key.
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key);
}
