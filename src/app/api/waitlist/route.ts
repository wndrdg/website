import { Resend } from "resend";
import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const resend = new Resend(process.env.RESEND_API_KEY);
const BLOB_PATHNAME = "waitlist.json";

type Entry = {
  name?: string;
  zip?: string;
  email: string;
  date: string;
};

async function readWaitlist(): Promise<Entry[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!blob) return [];
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Entry[];
  } catch {
    return [];
  }
}

async function appendWaitlist(entry: Omit<Entry, "date">) {
  const entries = await readWaitlist();
  entries.push({ ...entry, date: new Date().toISOString() });
  await put(BLOB_PATHNAME, JSON.stringify(entries, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function POST(request: Request) {
  try {
    const { name, zip, email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Save to Vercel Blob — don't block the user-facing flow on storage errors
    try {
      await appendWaitlist({ name, zip, email });
    } catch (err) {
      console.error("Blob write failed:", err);
    }

    // Send notification email via Resend
    const details = [
      `Email: ${email}`,
      name ? `Name: ${name}` : null,
      zip ? `Zip: ${zip}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await resend.emails.send({
      from: "Wonder Dog <onboarding@resend.dev>",
      to: "hr@wonder.dog",
      subject: "New Waitlist Signup",
      text: `New waitlist signup:\n${details}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 },
    );
  }
}
