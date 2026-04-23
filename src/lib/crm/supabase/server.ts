import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using service role key.
// Bypasses RLS — only use in Server Components and API routes.
//
// Defensive trim: env var values occasionally end up with stray whitespace
// or surrounding quotes when pasted through multiple layers. Anything
// non-base64-ish in a JWT will make Supabase return "Invalid API key".
function cleanEnv(v: string | undefined): string | undefined {
  if (!v) return v;
  let t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  // Strip any whitespace characters anywhere inside (handles \n, \r, \t
  // smuggled in during multi-line paste). JWTs never contain whitespace.
  return t.replace(/\s+/g, "");
}

export function createServerClient() {
  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
