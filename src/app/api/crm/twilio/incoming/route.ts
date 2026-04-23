import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get("From") as string;
  const body = formData.get("Body") as string;
  const sid = formData.get("MessageSid") as string;

  // Log inbound for now — will write to DB once Supabase is connected
  console.log(`[SMS INBOUND] From: ${from} | SID: ${sid} | Body: ${body}`);

  // Return empty TwiML (no auto-reply)
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { "Content-Type": "text/xml" } },
  );
}
