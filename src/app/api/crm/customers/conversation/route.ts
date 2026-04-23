import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { customer_id, open } = await req.json();

    if (!customer_id || typeof open !== "boolean") {
      return NextResponse.json({ error: "Missing customer_id or open" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("crm_customers")
      .update({
        last_contact_at: open ? new Date().toISOString() : null,
      })
      .eq("id", customer_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, open });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
