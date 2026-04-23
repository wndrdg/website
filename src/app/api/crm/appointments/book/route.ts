import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { customer_id, vet_tech_id, start_hour, start_min, duration_min } = await req.json();

    if (!customer_id || !vet_tech_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();
    const today = new Date().toISOString().split("T")[0];

    const startTime = `${String(start_hour).padStart(2, "0")}:${String(start_min).padStart(2, "0")}`;
    const endMin = start_min + duration_min;
    const endHour = start_hour + Math.floor(endMin / 60);
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;

    // Get customer's dog
    const { data: dogs } = await supabase
      .from("crm_dogs")
      .select("id")
      .eq("customer_id", customer_id)
      .limit(1);

    const { data: appointment, error } = await supabase
      .from("crm_appointments")
      .insert({
        customer_id,
        dog_id: dogs?.[0]?.id ?? null,
        vet_tech_id,
        appointment_date: today,
        start_time: startTime,
        end_time: endTime,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(appointment);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
