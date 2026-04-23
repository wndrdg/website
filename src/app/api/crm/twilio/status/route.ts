import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const sid = formData.get("MessageSid") as string;
  const status = formData.get("MessageStatus") as string;

  console.log(`[SMS STATUS] SID: ${sid} | Status: ${status}`);

  return NextResponse.json({ ok: true });
}
