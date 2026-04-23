import { NextResponse } from "next/server";

// Diagnostic endpoint — reports which CRM env vars Vercel actually has set.
// Gated by Basic Auth through proxy.ts (covers /api/crm/**). Only reports
// presence and a length hint, never the value itself.
export async function GET() {
  const check = (name: string) => {
    const v = process.env[name];
    return v
      ? { present: true, length: v.length, preview: v.slice(0, 6) + "…" }
      : { present: false };
  };

  return NextResponse.json({
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: check("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: check("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: check("SUPABASE_SERVICE_ROLE_KEY"),
      SUPABASE_DB_URL: check("SUPABASE_DB_URL"),
      TWILIO_ACCOUNT_SID: check("TWILIO_ACCOUNT_SID"),
      TWILIO_AUTH_TOKEN: check("TWILIO_AUTH_TOKEN"),
      TWILIO_PHONE_NUMBER: check("TWILIO_PHONE_NUMBER"),
    },
  });
}
