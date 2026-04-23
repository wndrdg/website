import { NextResponse } from "next/server";

// Temporary diagnostic — reports which Auth.js env vars Vercel has set.
// Reports presence, length, and first/last chars only, never values.
export async function GET() {
  const check = (name: string) => {
    const v = process.env[name];
    if (!v) return { present: false };
    return {
      present: true,
      length: v.length,
      preview: `${v.slice(0, 8)}…${v.slice(-6)}`,
      hasLeadingWhitespace: /^\s/.test(v),
      hasTrailingWhitespace: /\s$/.test(v),
      hasInternalWhitespace: /\s/.test(v.slice(1, -1).trim()),
    };
  };

  return NextResponse.json({
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    env: {
      GOOGLE_CLIENT_ID: check("GOOGLE_CLIENT_ID"),
      GOOGLE_CLIENT_SECRET: check("GOOGLE_CLIENT_SECRET"),
      AUTH_SECRET: check("AUTH_SECRET"),
      NEXTAUTH_URL: check("NEXTAUTH_URL"),
      AUTH_URL: check("AUTH_URL"),
    },
  });
}
