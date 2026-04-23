import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { enabled } = await req.json();
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Missing enabled" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("crm_agent_config")
      .update({ enabled })
      .eq("id", 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, enabled });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
