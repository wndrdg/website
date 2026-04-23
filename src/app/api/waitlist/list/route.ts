import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/crm/supabase/server";

// Returns the full waitlist as a JSON array for use by the /waitlist-codes
// admin page. Reads from Supabase crm_waitlist (Supabase is now the source
// of truth for waitlist signups — the legacy Vercel Blob signups/* path is
// retained as a historical backup but no longer written to).
//
// Gated by Basic Auth through proxy.ts (admin surface).
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("crm_waitlist")
      .select(
        "id, email, first_name, last_name, phone, zip, city, dog_name, dog_breed, source, referral_code, sms_consent, status, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase waitlist read failed:", error);
      return NextResponse.json(
        { error: "Failed to read waitlist" },
        { status: 500 },
      );
    }

    // Reshape to match the legacy consumer (waitlist-codes page), which
    // expects fields like `name`, `email`, `phone`, `address`, `dogs`,
    // `invite_code`, `date`, `smsConsent`.
    const entries = (data || []).map((r) => ({
      date: r.created_at,
      email: r.email,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ") || undefined,
      phone: r.phone || undefined,
      zip: r.zip || undefined,
      addressParts: r.city || r.zip ? { city: r.city || undefined, zip: r.zip || undefined } : undefined,
      dogs:
        r.dog_name || r.dog_breed
          ? [{ name: r.dog_name || undefined, breed: r.dog_breed || undefined }]
          : undefined,
      smsConsent: !!r.sms_consent,
      invite_code: r.referral_code || undefined,
    }));

    return NextResponse.json({
      count: entries.length,
      entries,
    });
  } catch (err) {
    console.error("Failed to list waitlist:", err);
    return NextResponse.json(
      { error: "Failed to read waitlist" },
      { status: 500 },
    );
  }
}
