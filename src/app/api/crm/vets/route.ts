import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

// Returns active vets + vet_techs for appointment-booking pickers.
// Gated by proxy Google OAuth (CRM surface).
export async function GET() {
  try {
    const supabase = createServerClient();
    const [vets, vet_techs] = await Promise.all([
      supabase.from("crm_vets").select("id, name, email, is_active").order("name"),
      supabase
        .from("crm_vet_techs")
        .select("id, name, city, is_active")
        .order("name"),
    ]);
    return NextResponse.json({
      vets: vets.data || [],
      vet_techs: vet_techs.data || [],
    });
  } catch (err) {
    console.error("vets list failed:", err);
    return NextResponse.json({ vets: [], vet_techs: [] }, { status: 500 });
  }
}
