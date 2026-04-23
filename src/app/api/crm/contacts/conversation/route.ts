import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/crm/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { contact_id, open } = await req.json();

    if (!contact_id || typeof open !== "boolean") {
      return NextResponse.json({ error: "Missing contact_id or open" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("crm_contacts")
      .update({
        last_contact_at: open ? new Date().toISOString() : null,
      })
      .eq("id", contact_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Purge cached pages that show contact state so the next render is fresh.
    revalidatePath("/waitlist");
    revalidatePath("/contacts");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, open });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
