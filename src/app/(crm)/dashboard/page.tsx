import { createServerClient } from "@/lib/crm/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import { Users, ClipboardList, Calendar, Microscope, MessageSquare } from "lucide-react";
import { formatRelativeTime } from "@/lib/crm/utils/formatters";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerClient();

  const today = new Date().toISOString().split("T")[0];

  const [
    { count: customerCount },
    { count: waitlistCount },
    { count: todayAppointments },
    { data: pendingApproval },
    { data: conversations },
    { data: customers },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("crm_customers").select("*", { count: "exact", head: true }),
    supabase.from("crm_waitlist").select("*", { count: "exact", head: true }).eq("status", "waiting"),
    supabase.from("crm_appointments").select("*", { count: "exact", head: true }).eq("appointment_date", today),
    supabase.from("crm_customers").select("id").eq("lifecycle_stage", "labs_need_approval"),
    supabase.from("crm_customers").select("id").not("last_contact_at", "is", null),
    supabase.from("crm_customers").select("lifecycle_stage"),
    supabase.from("crm_customer_events").select("*, crm_customers(full_name)").order("created_at", { ascending: false }).limit(20),
  ]);

  const stats = [
    { label: "Customers", value: customerCount ?? 0, icon: Users },
    { label: "Waitlist", value: waitlistCount ?? 0, icon: ClipboardList },
    { label: "Today's Appointments", value: todayAppointments ?? 0, icon: Calendar },
    { label: "Pending Approval", value: pendingApproval?.length ?? 0, icon: Microscope },
    { label: "Open Conversations", value: conversations?.length ?? 0, icon: MessageSquare },
  ];

  // Funnel data — aligned to current lifecycle stages
  const stageCounts: Record<string, number> = {};
  customers?.forEach((c) => {
    stageCounts[c.lifecycle_stage] = (stageCounts[c.lifecycle_stage] || 0) + 1;
  });

  const funnelStages: { key: string; label: string; color: string }[] = [
    { key: "onboarded", label: "Onboarded", color: "#9CA3AF" },
    { key: "lab_scheduled", label: "Lab Scheduled", color: "hsl(var(--primary))" },
    { key: "labs_pending", label: "Labs Pending", color: "#6B7280" },
    { key: "labs_need_approval", label: "Pending Approval", color: "#18181B" },
    { key: "lab_complete", label: "Lab Complete", color: "hsl(var(--primary))" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Lifecycle Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Customer Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelStages.map((stage) => {
              const count = stageCounts[stage.key] || 0;
              const max = Math.max(...funnelStages.map((s) => stageCounts[s.key] || 0), 1);
              const pct = (count / max) * 100;

              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-36 truncate">
                    {stage.label}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: stage.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentEvents?.map((event: any) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p>
                      <span className="font-medium">
                        {event.crm_customers?.full_name ?? "Unknown"}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {event.event_type.replace(/_/g, " ")}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
