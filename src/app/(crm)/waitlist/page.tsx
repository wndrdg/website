import { createServerClient } from "@/lib/crm/supabase/server";
import { list, get } from "@vercel/blob";
import { WaitlistBrowser } from "@/components/crm/waitlist/WaitlistBrowser";
import type { WaitlistContact, CodeMeta } from "@/components/crm/waitlist/types";

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
        } catch { /* ignore */ }
      }),
    );
    return result;
  } catch {
    return result;
  }
}

export default async function WaitlistPage() {
  const supabase = createServerClient();

  // Pull waitlist contacts + their active appointments in two queries. Two
  // queries is fine at this scale (< a few thousand); we merge in memory.
  const [{ data: contacts }, { data: appts }] = await Promise.all([
    supabase
      .from("crm_contacts")
      .select(
        "id, email, phone, first_name, last_name, street, apt, city, state, zip, dog_name, dog_breed, sms_consent, waitlist_source, referral_code, utm_source, utm_medium, utm_campaign, lifecycle_stage, is_waitlist, is_beta, is_customer, last_contact_at, created_at",
      )
      .eq("is_waitlist", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_appointments")
      .select("contact_id, type, status")
      .not("status", "in", '("cancelled","no_show")'),
  ]);

  // Index appointments by contact + type
  const vcprByContact = new Set<string>();
  const drawByContact = new Set<string>();
  for (const a of appts || []) {
    if (!a.contact_id) continue;
    if (a.type === "vcpr") vcprByContact.add(a.contact_id);
    if (a.type === "blood_draw") drawByContact.add(a.contact_id);
  }

  const rows: WaitlistContact[] = (contacts || []).map((c) => ({
    ...(c as Omit<WaitlistContact, "has_vcpr" | "has_blood_draw">),
    has_vcpr: vcprByContact.has(c.id),
    has_blood_draw: drawByContact.has(c.id),
  }));

  const codes = Array.from(
    new Set(rows.map((r) => r.referral_code).filter((x): x is string => !!x)),
  );
  const codeMeta = await fetchCodeMeta(codes);

  return <WaitlistBrowser entries={rows} codeMeta={codeMeta} />;
}
