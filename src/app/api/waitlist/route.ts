import { Resend } from "resend";
import { NextResponse } from "next/server";
import { put, list, get } from "@vercel/blob";

const resend = new Resend(process.env.RESEND_API_KEY);

type Dog = {
  name?: string;
  breed?: string;
  weight?: string;
  age?: string;
};

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

    const cleanDogs: Dog[] | undefined = Array.isArray(dogs)
      ? dogs
          .map((d: Dog) => ({
            name: d?.name || undefined,
            breed: d?.breed || undefined,
            weight: d?.weight || undefined,
            age: d?.age || undefined,
          }))
          .filter((d) => d.name || d.breed || d.weight || d.age)
      : undefined;

    const entry = {
      email,
      name: name || undefined,
      zip: (addressParts?.zip || zip) || undefined,
      phone: phone || undefined,
      smsConsent: !!smsConsent,
      invite_code: invite_code || undefined,
      address: address || undefined,
      addressParts: addressParts || undefined,
      dogs: cleanDogs && cleanDogs.length > 0 ? cleanDogs : undefined,
      contactPreference: contactPreference || undefined,
      date: new Date().toISOString(),
    };

    // Append-only: each signup gets its own blob under signups/. No read-modify-write,
    // so no race conditions and no CDN cache headaches. Use the timestamp + email hash
    // for the pathname so it sorts naturally and is uniquely addressable.
    try {
      const safeEmail = email.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const pathname = `signups/${entry.date}-${safeEmail}.json`;
      await put(pathname, JSON.stringify(entry, null, 2), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } catch (err) {
      console.error("Blob write failed:", err);
    }

    // Send notification email via Resend (verified wonder.dog domain)
    // Look up invite code description if present
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
      cleanDogs && cleanDogs.length > 0
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
  } catch {
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 },
    );
  }
}
