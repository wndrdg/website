import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

// Returns the full waitlist as a JSON array. Lists every blob under signups/,
// fetches each one with the BLOB token, and combines them sorted by date.
//
// Auth: requires the BLOB_READ_WRITE_TOKEN as a Bearer header so this isn't
// world-readable. To download from a terminal:
//   curl https://wonder.dog/api/waitlist/all -H "Authorization: Bearer $BLOB_READ_WRITE_TOKEN"
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "signups/" });

    const entries = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      }),
    );

    const valid = entries
      .filter((e): e is Record<string, unknown> => e !== null)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    return NextResponse.json({
      count: valid.length,
      entries: valid,
    });
  } catch (err) {
    console.error("Failed to list waitlist:", err);
    return NextResponse.json({ error: "Failed to read waitlist" }, { status: 500 });
  }
}
