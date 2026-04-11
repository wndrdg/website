import { Resend } from "resend";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, zip, email, phone, smsConsent } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const entry = {
      email,
      name: name || undefined,
      zip: zip || undefined,
      phone: phone || undefined,
      smsConsent: !!smsConsent,
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
    const details = [
      `Email: ${email}`,
      name ? `Name: ${name}` : null,
      phone ? `Phone: ${phone}` : null,
      zip ? `Zip: ${zip}` : null,
      `SMS Consent: ${smsConsent ? "Yes" : "No"}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await resend.emails.send({
        from: "Wonder Dog <noreply@wonder.dog>",
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
