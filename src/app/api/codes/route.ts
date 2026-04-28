import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { getAllInviteCodes, invalidateInviteCodesCache } from "@/lib/crm/invite-codes";
import { createServerClient } from "@/lib/crm/supabase/server";

// Alphabet for 4-character codes: no ambiguous characters (0/O, 1/I/L removed)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

async function getExistingCodes(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: "codes/" });
    return blobs.map((blob) => {
      const filename = blob.pathname.split("/").pop() || "";
      return filename.replace(".json", "");
    });
  } catch (error) {
    console.error("Error fetching existing codes:", error);
    return [];
  }
}

async function getCodesWithSignupCounts(): Promise<
  Array<{
    code: string;
    description: string;
    note?: string;
    created: string;
    signups: number;
  }>
> {
  try {
    // 1. Code metadata — cached map keyed by code (Vercel Blob, 5-min TTL).
    const codeMap = await getAllInviteCodes();

    // 2. Signup counts — from Supabase crm_contacts where referral_code is
    //    set. Replaces the old (broken on prod) "iterate every signups/* blob
    //    and tally by invite_code" path. After the contact-centric migration,
    //    the truth lives in Supabase.
    const supabase = createServerClient();
    const { data: contactsWithCode } = await supabase
      .from("crm_contacts")
      .select("referral_code")
      .not("referral_code", "is", null);

    const countByCode = new Map<string, number>();
    for (const c of contactsWithCode || []) {
      const code = (c as { referral_code: string | null }).referral_code;
      if (!code) continue;
      countByCode.set(code, (countByCode.get(code) || 0) + 1);
    }

    return Object.entries(codeMap).map(([code, meta]) => ({
      code,
      description: meta.description ?? "",
      note: meta.note,
      created: meta.created ?? "",
      signups: countByCode.get(code) || 0,
    }));
  } catch (error) {
    console.error("Error getting codes with signup counts:", error);
    return [];
  }
}

// GET: List all codes with signup counts
export async function GET() {
  try {
    const codes = await getCodesWithSignupCounts();
    return NextResponse.json({ codes });
  } catch (error) {
    console.error("GET /api/codes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch codes" },
      { status: 500 },
    );
  }
}

// POST: Create a new code
export async function POST(request: Request) {
  try {
    const { description, note } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    // Get existing codes to ensure uniqueness
    const existingCodes = await getExistingCodes();

    // Generate unique code
    let code: string;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
      if (attempts > 100) {
        return NextResponse.json(
          { error: "Failed to generate unique code" },
          { status: 500 },
        );
      }
    } while (existingCodes.includes(code));

    // Store the code (private access to match store configuration)
    const noteTrimmed =
      typeof note === "string" && note.trim() ? note.trim() : undefined;
    const codeData = {
      code,
      description: description.trim(),
      ...(noteTrimmed ? { note: noteTrimmed } : {}),
      created: new Date().toISOString(),
    };

    await put(`codes/${code}.json`, JSON.stringify(codeData, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    invalidateInviteCodesCache();

    return NextResponse.json({
      success: true,
      code: codeData,
    });
  } catch (error) {
    console.error("POST /api/codes error:", error);
    return NextResponse.json(
      { error: "Failed to create code" },
      { status: 500 },
    );
  }
}
