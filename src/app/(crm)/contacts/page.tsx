import { createServerClient } from "@/lib/crm/supabase/server";
import { ContactTable } from "@/components/crm/contacts/ContactTable";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const supabase = createServerClient();

  const [{ data: contacts }, { data: crmUsers }] = await Promise.all([
    supabase
      .from("crm_contacts")
      .select("*, crm_dogs(*), crm_notes(*), crm_sms_messages(*), crm_blood_draws(*), crm_vet_records_requests(*)")
      .order("created_at", { ascending: false }),
    supabase.from("crm_users").select("id, name"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMap = Object.fromEntries((crmUsers ?? []).map((u: any) => [u.id, u.name]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = (contacts ?? []).map((c: any) => ({
    ...c,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    crm_sms_messages: ((c.crm_sms_messages as any[]) ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any) => ({
        ...m,
        sent_by: m.sent_by ? userMap[m.sent_by] ?? "Agent" : null,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    crm_notes: ((c.crm_notes as any[]) ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-sm text-muted-foreground">{enriched.length} total</p>
      </div>

      <ContactTable contacts={enriched} />
    </div>
  );
}
