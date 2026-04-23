import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

const ALLOWED_STATUSES = new Set([
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);

// PATCH /api/crm/appointments/[id]
//
// Body: { status?, notes?, scheduled_at?, duration_minutes? }
// Used by the inspector's appointment dialog for cancel / mark-complete /
// edit actions. Only fields that are provided get updated.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (typeof body.status === "string") {
      if (!ALLOWED_STATUSES.has(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = body.status;
    }
    if (body.notes !== undefined) updates.notes = body.notes || null;
    if (typeof body.scheduled_at === "string") updates.scheduled_at = body.scheduled_at;
    if (typeof body.duration_minutes === "number") updates.duration_minutes = body.duration_minutes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("crm_appointments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
