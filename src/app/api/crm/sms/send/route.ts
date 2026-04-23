import { NextRequest, NextResponse } from "next/server";
import { getTwilioClient, getTwilioNumber } from "@/lib/crm/twilio/client";

export async function POST(req: NextRequest) {
  try {
    const { to, body } = await req.json();

    if (!to || !body) {
      return NextResponse.json({ error: "Missing 'to' or 'body'" }, { status: 400 });
    }

    const client = getTwilioClient();
    const message = await client.messages.create({
      to,
      from: getTwilioNumber(),
      body,
    });

    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
