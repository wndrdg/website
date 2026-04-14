import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

// Alphabet for 4-character codes: no ambiguous characters (0/O, 1/I/L removed)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

async function getExistingCodes(): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix: 'codes/' });
    return blobs.map(blob => {
      const filename = blob.pathname.split('/').pop() || '';
      return filename.replace('.json', '');
    });
  } catch (error) {
    console.error('Error fetching existing codes:', error);
    return [];
  }
}

async function getCodesWithSignupCounts(): Promise<Array<{
  code: string;
  description: string;
  created: string;
  signups: number;
}>> {
  try {
    const { blobs } = await list({ prefix: 'codes/' });
    const codesData = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const response = await fetch(blob.url);
          const data = await response.json();
          
          // Count signups for this code
          const { blobs: signupBlobs } = await list({ prefix: 'signups/' });
          const signupCount = await Promise.all(
            signupBlobs.map(async (signupBlob) => {
              try {
                const signupResponse = await fetch(signupBlob.url);
                const signupData = await signupResponse.json();
                return signupData.invite_code === data.code ? 1 : 0;
              } catch {
                return 0;
              }
            })
          );
          
          return {
            code: data.code,
            description: data.description,
            created: data.created,
            signups: signupCount.reduce((total: number, count) => total + count, 0)
          };
        } catch (error) {
          console.error(`Error processing code blob ${blob.pathname}:`, error);
          return null;
        }
      })
    );
    
    return codesData.filter(Boolean) as Array<{
      code: string;
      description: string;
      created: string;
      signups: number;
    }>;
  } catch (error) {
    console.error('Error getting codes with signup counts:', error);
    return [];
  }
}

// GET: List all codes with signup counts
export async function GET() {
  try {
    const codes = await getCodesWithSignupCounts();
    return NextResponse.json({ codes });
  } catch (error) {
    console.error('GET /api/codes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch codes' },
      { status: 500 }
    );
  }
}

// POST: Create a new code
export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
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
          { error: 'Failed to generate unique code' },
          { status: 500 }
        );
      }
    } while (existingCodes.includes(code));

    // Store the code
    const codeData = {
      code,
      description: description.trim(),
      created: new Date().toISOString(),
    };

    await put(`codes/${code}.json`, JSON.stringify(codeData, null, 2), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
    });

    return NextResponse.json({ 
      success: true, 
      code: codeData 
    });
  } catch (error) {
    console.error('POST /api/codes error:', error);
    return NextResponse.json(
      { error: 'Failed to create code' },
      { status: 500 }
    );
  }
}