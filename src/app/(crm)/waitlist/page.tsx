import { createServerClient } from "@/lib/crm/supabase/server";
import { list, get } from "@vercel/blob";
import { WaitlistBrowser } from "@/components/crm/waitlist/WaitlistBrowser";
import type { WaitlistEntry, CodeMeta } from "@/components/crm/waitlist/types";

export const dynamic = "force-dynamic";

async function fetchCodeMeta(codes: string[]): Promise<Record<string, CodeMeta>> {
  if (codes.length === 0) return {};
  const result: Record<string, CodeMeta> = {};
  try {
    const { blobs } = await list({ prefix: "codes/" });
    const wanted = new Set(codes);
    const relevant = blobs.filter((b) => {
      const filename = b.pathname.split("/").pop() || "";
      return wanted.has(filename.replace(".json", ""));
    });
    await Promise.all(
      relevant.map(async (b) => {
        try {
          const resp = await get(b.url, { access: "private" });
          if (!resp) return;
          const text = await new Response(resp.stream).text();
          const data = JSON.parse(text);
          if (typeof data?.code === "string") {
            result[data.code] = {
              description: data.description,
              note: data.note,
              created: data.created,
            };
          }
        } catch {
          /* ignore one-off failures */
        }
      }),
    );
    return result;
  } catch {
    return result;
  }
}

export default async function WaitlistPage() {
  const supabase = createServerClient();

  const { data: entries } = await supabase
    .from("crm_waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (entries || []) as WaitlistEntry[];
  const codes = Array.from(
    new Set(rows.map((e) => e.referral_code).filter(Boolean) as string[]),
  );
  const codeMeta = await fetchCodeMeta(codes);

  return <WaitlistBrowser entries={rows} codeMeta={codeMeta} />;
}
