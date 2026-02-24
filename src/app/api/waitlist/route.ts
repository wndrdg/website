import { Resend } from "resend";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);
const DATA_FILE = path.join(process.cwd(), "waitlist.json");

async function saveEmail(email: string) {
  let emails: { email: string; date: string }[] = [];
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    emails = JSON.parse(data);
  } catch {
    // file doesn't exist yet
  }
  emails.push({ email, date: new Date().toISOString() });
  await fs.writeFile(DATA_FILE, JSON.stringify(emails, null, 2));
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Save locally
    try {
      await saveEmail(email);
    } catch {
      // don't block on file write errors (e.g. serverless)
    }

    // Send notification
    await resend.emails.send({
      from: "Wonder Dog <onboarding@resend.dev>",
      to: "hr@wonder.dog",
      subject: "New Waitlist Signup",
      text: `New waitlist signup: ${email}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 },
    );
  }
}
