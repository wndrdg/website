import { createServerClient } from "@/lib/crm/supabase/server";
import { CalendarView } from "@/components/crm/blood-draws/CalendarView";

// 30s cache; router.refresh() purges on mutations.
export const revalidate = 30;

export default async function BloodDrawsPage() {
  const supabase = createServerClient();

  const today = new Date().toISOString().split("T")[0];

  const [{ data: vetTechs }, { data: appointments }, { data: allCustomers }] = await Promise.all([
    supabase
      .from("crm_vet_techs")
      .select("*")
      .eq("is_active", true)
      .order("city")
      .order("name"),
    supabase
      .from("crm_appointments")
      .select("*, crm_contacts(full_name), crm_vet_techs(name, city)")
      .eq("appointment_date", today)
      .order("start_time"),
    supabase
      .from("crm_contacts")
      .select("id, full_name, city, state")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  const formattedTechs = (vetTechs ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    city: t.city,
    region: t.region,
  }));

  const formattedAppointments = (appointments ?? []).map((a: any) => {
    const [startH, startM] = a.start_time.split(":").map(Number);
    const [endH, endM] = a.end_time.split(":").map(Number);
    const durationMin = (endH * 60 + endM) - (startH * 60 + startM);

    return {
      id: a.id,
      techId: a.vet_tech_id,
      customerName: a.crm_contacts?.full_name ?? "Unknown",
      customerCity: a.city ?? "",
      startHour: startH,
      startMin: startM,
      durationMin,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Today &middot; {formattedAppointments.length} appointments
        </p>
      </div>
      <CalendarView vetTechs={formattedTechs} appointments={formattedAppointments} customers={allCustomers ?? []} />
    </div>
  );
}
