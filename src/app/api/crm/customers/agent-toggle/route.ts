import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { customer_id, agent_enabled, human_requested } = await req.json();

    if (!customer_id) {
      return NextResponse.json({ error: "Missing customer_id" }, { status: 400 });
    }

    const update: Record<string, boolean> = {};
    if (typeof agent_enabled === "boolean") update.agent_enabled = agent_enabled;
    if (typeof human_requested === "boolean") update.human_requested = human_requested;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("crm_customers")
      .update(update)
      .eq("id", customer_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...update });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
