import { list, get } from "@vercel/blob";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.API_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // List all vibe-check blobs
  const blobs = [];
  let cursor: string | undefined;
  do {
    const result = await list({
      prefix: "vibe-check/",
      cursor,
    });
    blobs.push(...result.blobs);
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  // Fetch each blob's contents
  const responses = await Promise.all(
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

  const data = responses.filter(Boolean);

  // CSV export
  if (searchParams.get("format") === "csv") {
    const headers = [
      "id",
      "name",
      "email",
      "phone",
      "timezone",
      "canText",
      "background",
      "salary",
      "framework",
      "css",
      "components",
      "tool",
      "model",
      "stuck",
      "rn_styling",
      "rn_iterate",
      "elapsed_seconds",
      "submitted_at",
    ];

    const escape = (v: string) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const rows = data.map((r) =>
      [
        r.id,
        r.contact?.name,
        r.contact?.email,
        r.contact?.phone,
        r.contact?.timezone,
        r.contact?.canText,
        r.contact?.background,
        r.contact?.salary,
        r.answers?.framework,
        r.answers?.css,
        r.answers?.components,
        r.answers?.tool,
        r.answers?.model,
        r.answers?.stuck,
        r.answers?.rn_styling,
        r.answers?.rn_iterate,
        r.meta?.elapsed_seconds,
        r.meta?.submitted_at,
      ]
        .map(escape)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=vibe-check-responses.csv",
      },
    });
  }

  return Response.json(data);
}
