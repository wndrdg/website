import { createServerClient } from "@/lib/crm/supabase/server";
import { CustomerTable } from "@/components/crm/customers/CustomerTable";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = createServerClient();

  const [{ data: customers }, { data: crmUsers }] = await Promise.all([
    supabase
      .from("crm_customers")
      .select("*, crm_dogs(*), crm_notes(*), crm_sms_messages(*), crm_blood_draws(*), crm_vet_records_requests(*)")
      .order("created_at", { ascending: false }),
    supabase.from("crm_users").select("id, name"),
  ]);

  // Map agent IDs to names in SMS messages
  const userMap = Object.fromEntries((crmUsers ?? []).map((u: any) => [u.id, u.name]));
  const enriched = (customers ?? []).map((c: any) => ({
    ...c,
    crm_sms_messages: (c.crm_sms_messages ?? [])
      .map((m: any) => ({
        ...m,
        sent_by: m.sent_by ? userMap[m.sent_by] ?? "Agent" : null,
      }))
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    crm_notes: (c.crm_notes ?? [])
      .sort((a: any, b: any) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">{enriched.length} total</p>
      </div>

      <CustomerTable customers={enriched} />
    </div>
  );
}
