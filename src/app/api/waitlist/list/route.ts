import { NextResponse } from "next/server";
import { list, get } from "@vercel/blob";

// Returns the full waitlist as a JSON array for use by the admin page.
// Unauthenticated to match the existing /api/codes pattern — this endpoint
// is consumed by the client-rendered /waitlist-codes page, which itself is
// unauthenticated. If that posture changes, gate this too.
export async function GET() {
  try {
    const { blobs } = await list({ prefix: "signups/" });

    const entries = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const resp = await get(blob.url, { access: "private" });
          if (!resp) return null;
          const text = await new Response(resp.stream).text();
          return JSON.parse(text);
        } catch {
          return null;
        }
      }),
    );

    const valid = entries
      .filter((e): e is Record<string, unknown> => e !== null)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    return NextResponse.json({
      count: valid.length,
      entries: valid,
    });
  } catch (err) {
    console.error("Failed to list waitlist:", err);
    return NextResponse.json(
      { error: "Failed to read waitlist" },
      { status: 500 },
    );
  }
}
