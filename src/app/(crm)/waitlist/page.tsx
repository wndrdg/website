import { createServerClient } from "@/lib/crm/supabase/server";
import { getAllInviteCodes } from "@/lib/crm/invite-codes";
import { WaitlistBrowser } from "@/components/crm/waitlist/WaitlistBrowser";
import type {
  WaitlistContact,
  WaitlistAppointment,
} from "@/components/crm/waitlist/types";

// Cache for 30s. Mutations (book/cancel/mark contacted) call router.refresh()
// which purges the cache and forces a fresh render — so the user always sees
// the result of their own action immediately. Other tabs/users see at most
// 30s-stale data, which is fine for a CRM list.
export const revalidate = 30;

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
      .select(
        "id, contact_id, type, scheduled_at, duration_minutes, status, notes, address, city, state, zip, crm_vets(name), crm_vet_techs(name)",
      )
      .not("status", "in", '("cancelled","no_show")')
      .order("scheduled_at", { ascending: true }),
  ]);

  // Index appointments by contact
  const byContact = new Map<string, WaitlistAppointment[]>();
  const vcprByContact = new Set<string>();
  const drawByContact = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const a of (appts as any[]) || []) {
    if (!a.contact_id) continue;
    if (a.type === "vcpr") vcprByContact.add(a.contact_id);
    if (a.type === "blood_draw") drawByContact.add(a.contact_id);
    const list = byContact.get(a.contact_id) || [];
    list.push({
      id: a.id,
      type: a.type,
      scheduled_at: a.scheduled_at,
      duration_minutes: a.duration_minutes,
      status: a.status,
      notes: a.notes,
      vet_name: a.crm_vets?.name ?? null,
      vet_tech_name: a.crm_vet_techs?.name ?? null,
      address: a.address,
      city: a.city,
      state: a.state,
      zip: a.zip,
    });
    byContact.set(a.contact_id, list);
  }

  const rows: WaitlistContact[] = (contacts || []).map((c) => ({
    ...(c as Omit<WaitlistContact, "has_vcpr" | "has_blood_draw" | "appointments">),
    has_vcpr: vcprByContact.has(c.id),
    has_blood_draw: drawByContact.has(c.id),
    appointments: byContact.get(c.id) || [],
  }));

  // One cached call returns the whole codes/* map. Filter in memory to
  // just the codes referenced by the waitlist rows.
  const allCodes = await getAllInviteCodes();
  const referenced = new Set(
    rows.map((r) => r.referral_code).filter((x): x is string => !!x),
  );
  const codeMeta = Object.fromEntries(
    Object.entries(allCodes).filter(([code]) => referenced.has(code)),
  );

  return <WaitlistBrowser entries={rows} codeMeta={codeMeta} />;
}
