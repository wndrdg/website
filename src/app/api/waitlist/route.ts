import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Wonder Dog Waitlist <waitlist@wonder.dog>",
      to: "hr@wonder.dog",
      subject: "New Waitlist Signup",
      text: `New waitlist signup: ${email}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 }
    );
  }
}
