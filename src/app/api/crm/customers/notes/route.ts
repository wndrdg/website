import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { customer_id, body } = await req.json();

    if (!customer_id || !body?.trim()) {
      return NextResponse.json({ error: "Missing customer_id or body" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get the first CRM user as the author (for now)
    const { data: users } = await supabase.from("crm_users").select("id").limit(1);
    const createdBy = users?.[0]?.id ?? null;

    const { data: note, error } = await supabase
      .from("crm_notes")
      .insert({
        customer_id,
        body: body.trim(),
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(note);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
