import { NextResponse } from "next/server";
import { put, list, get } from "@vercel/blob";

// Alphabet for 4-character codes: no ambiguous characters (0/O, 1/I/L removed)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

async function readPrivateBlobJson(url: string) {
  const resp = await get(url, { access: "private" });
  if (!resp) return null;
  const text = await new Response(resp.stream).text();
  return JSON.parse(text);
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
    // Fetch all code metadata in parallel
    const { blobs: codeBlobs } = await list({ prefix: "codes/" });
    const codes = (
      await Promise.all(
        codeBlobs.map(async (blob) => {
          try {
            return await readPrivateBlobJson(blob.url);
          } catch (error) {
            console.error(`Error reading code blob ${blob.pathname}:`, error);
            return null;
          }
        }),
      )
    ).filter(Boolean) as Array<{
      code: string;
      description: string;
      note?: string;
      created: string;
    }>;

    // List all signups once, then read each and tally by invite_code
    const { blobs: signupBlobs } = await list({ prefix: "signups/" });
    const signups = (
      await Promise.all(
        signupBlobs.map(async (blob) => {
          try {
            return await readPrivateBlobJson(blob.url);
          } catch {
            return null;
          }
        }),
      )
    ).filter(Boolean) as Array<{ invite_code?: string }>;

    const countByCode = new Map<string, number>();
    for (const signup of signups) {
      if (signup.invite_code) {
        countByCode.set(
          signup.invite_code,
          (countByCode.get(signup.invite_code) || 0) + 1,
        );
      }
    }

    return codes.map((c) => ({
      code: c.code,
      description: c.description,
      note: c.note,
      created: c.created,
      signups: countByCode.get(c.code) || 0,
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
