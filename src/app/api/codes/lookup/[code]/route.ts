import { NextResponse } from "next/server";
import { list, get } from "@vercel/blob";

// Public, read-only lookup for a single invite code. Returns description only —
// never signup counts or other internal data. Used by /wl to personalize the
// invite reveal.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;

    if (!code || !/^[A-Z0-9]{4}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const { blobs } = await list({ prefix: `codes/${code}.json` });
    if (blobs.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const resp = await get(blobs[0].url, { access: "public" });
    if (!resp) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const text = await new Response(resp.stream).text();
    const data = JSON.parse(text);

    return NextResponse.json({
      code: data.code,
      description: data.description || "",
    });
  } catch (error) {
    console.error("GET /api/codes/lookup/[code] error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
