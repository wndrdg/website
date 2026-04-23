import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

// Book a VCPR or blood-draw appointment for a contact.
//
// Body:
//   contact_id       required, UUID
//   type             required, 'vcpr' | 'blood_draw'
//   scheduled_at     required, ISO timestamp
//   duration_minutes optional, default 30
//   vet_id           required if type === 'vcpr'
//   vet_tech_id      required if type === 'blood_draw'
//   notes            optional (useful for VCPR)
//   address/city/state/zip optional — where the appointment happens
export async function POST(req: NextRequest) {
  try {
    const {
      contact_id,
      type,
      scheduled_at,
      duration_minutes,
      vet_id,
      vet_tech_id,
      notes,
      address,
      city,
      state,
      zip,
    } = await req.json();

    if (!contact_id || !type || !scheduled_at) {
      return NextResponse.json(
        { error: "Missing required fields (contact_id, type, scheduled_at)" },
        { status: 400 },
      );
    }
    if (type !== "vcpr" && type !== "blood_draw") {
      return NextResponse.json(
        { error: "type must be 'vcpr' or 'blood_draw'" },
        { status: 400 },
      );
    }
    if (type === "vcpr" && !vet_id) {
      return NextResponse.json(
        { error: "vet_id is required for VCPR appointments" },
        { status: 400 },
      );
    }
    if (type === "blood_draw" && !vet_tech_id) {
      return NextResponse.json(
        { error: "vet_tech_id is required for blood-draw appointments" },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Grab the contact's first dog to link it
    const { data: dogs } = await supabase
      .from("crm_dogs")
      .select("id")
      .eq("contact_id", contact_id)
      .limit(1);

    const { data: appointment, error } = await supabase
      .from("crm_appointments")
      .insert({
        contact_id,
        dog_id: dogs?.[0]?.id ?? null,
        type,
        scheduled_at,
        duration_minutes: duration_minutes ?? 30,
        status: "scheduled",
        vet_id: type === "vcpr" ? vet_id : null,
        vet_tech_id: type === "blood_draw" ? vet_tech_id : null,
        notes: notes || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
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
