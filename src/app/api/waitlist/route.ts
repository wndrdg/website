import { Resend } from "resend";
import { NextResponse } from "next/server";
import { list, get } from "@vercel/blob";
import { createServerClient } from "@/lib/crm/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

type Dog = {
  name?: string;
  breed?: string;
  weight?: string;
  age?: string;
};

function splitName(full: string | undefined): { first: string | null; last: string | null } {
  if (!full) return { first: null, last: null };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { first: null, last: null };
  if (parts.length === 1) return { first: parts[0], last: null };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  try {
    const {
      name,
      zip,
      email,
      phone,
      smsConsent,
      invite_code,
      address,
      addressParts,
      dogs,
      contactPreference,
    } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanDogs: Dog[] = Array.isArray(dogs)
      ? dogs
          .map((d: Dog) => ({
            name: d?.name || undefined,
            breed: d?.breed || undefined,
            weight: d?.weight || undefined,
            age: d?.age || undefined,
          }))
          .filter((d) => d.name || d.breed || d.weight || d.age)
      : [];

    // Primary write: crm_contacts in Supabase with is_waitlist=true.
    // If a Contact already exists with this email, we flip is_waitlist on
    // and fill in any fields they hadn't given us before — no duplicates.
    const { first, last } = splitName(name);
    const supabase = createServerClient();

    const payload = {
      email,
      phone: phone || null,
      first_name: first,
      last_name: last,
      street: addressParts?.street || null,
      apt: addressParts?.apt || null,
      city: addressParts?.city || null,
      state: addressParts?.state || null,
      zip: addressParts?.zip || zip || null,
      dog_name: cleanDogs[0]?.name || null,
      dog_breed: cleanDogs[0]?.breed || null,
      waitlist_source: "website",
      referral_code: invite_code || null,
      sms_consent: !!smsConsent,
      is_waitlist: true,
      lifecycle_stage: "waitlist",
    };

    const { data: existing } = await supabase
      .from("crm_contacts")
      .select("id")
      .ilike("email", email)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error: updateError } = await supabase
        .from("crm_contacts")
        .update({ ...payload })
        .eq("id", existing[0].id);
      if (updateError) {
        console.error("Supabase update failed:", updateError);
        return NextResponse.json(
          { error: "Failed to process signup" },
          { status: 500 },
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("crm_contacts")
        .insert(payload);
      if (insertError) {
        console.error("Supabase insert failed:", insertError);
        return NextResponse.json(
          { error: "Failed to process signup" },
          { status: 500 },
        );
      }
    }

    // Invite code description is still looked up from Vercel Blob — invite
    // codes haven't been migrated to Supabase yet.
    let codeDescription = "";
    if (invite_code) {
      try {
        const { blobs } = await list({ prefix: `codes/${invite_code}.json` });
        if (blobs.length > 0) {
          const resp = await get(blobs[0].url, { access: "private" });
          if (resp) {
            const text = await new Response(resp.stream).text();
            const codeData = JSON.parse(text);
            codeDescription = codeData.description || "";
          }
        }
      } catch { /* ignore lookup failures */ }
    }

    const dogLines =
      cleanDogs.length > 0
        ? cleanDogs.map((d, i) => {
            const parts = [
              d.name ? `name: ${d.name}` : null,
              d.breed ? `breed: ${d.breed}` : null,
              d.weight ? `weight: ${d.weight}` : null,
              d.age ? `age: ${d.age}` : null,
            ]
              .filter(Boolean)
              .join(", ");
            return `  Dog ${i + 1}: ${parts}`;
          })
        : [];

    const details = [
      `Email: ${email}`,
      name ? `Name: ${name}` : null,
      phone ? `Phone: ${phone}` : null,
      zip ? `Zip: ${zip}` : null,
      address ? `Address: ${address}` : null,
      `SMS Consent: ${smsConsent ? "Yes" : "No"}`,
      contactPreference ? `Preferred Contact: ${contactPreference}` : null,
      invite_code ? `Invite Code: ${invite_code}` : null,
      codeDescription ? `Description: ${codeDescription}` : null,
      dogLines.length > 0 ? `Dogs:\n${dogLines.join("\n")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await resend.emails.send({
        from: "Wonderdog <noreply@wonder.dog>",
        to: "hr@wonder.dog",
        subject: "New Waitlist Signup",
        text: `New waitlist signup:\n${details}`,
      });
    } catch (err) {
      console.error("Resend send failed:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist POST failed:", err);
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 },
    );
  }
}
