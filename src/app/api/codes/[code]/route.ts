import { NextResponse } from "next/server";
import { put, list, del, get } from "@vercel/blob";

async function findCodeBlob(code: string) {
  const { blobs } = await list({ prefix: `codes/${code}.json` });
  return blobs[0] || null;
}

// PATCH: Update description of a code
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    const blob = await findCodeBlob(code);
    if (!blob) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    // Read existing to preserve created timestamp
    const resp = await get(blob.url, { access: "private" });
    if (!resp) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }
    const text = await new Response(resp.stream).text();
    const existing = JSON.parse(text);

    const updated = {
      ...existing,
      description: description.trim(),
    };

    await put(`codes/${code}.json`, JSON.stringify(updated, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, code: updated });
  } catch (error) {
    console.error("PATCH /api/codes/[code] error:", error);
    return NextResponse.json(
      { error: "Failed to update code" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a code
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const blob = await findCodeBlob(code);
    if (!blob) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    await del(blob.url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/codes/[code] error:", error);
    return NextResponse.json(
      { error: "Failed to delete code" },
      { status: 500 },
    );
  }
}
