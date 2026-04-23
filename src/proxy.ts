import { NextRequest, NextResponse } from "next/server";

// HTTP Basic Auth gate for the admin surface:
//   - /waitlist-codes (the admin UI)
//   - /api/codes (list/create) and /api/codes/:code (patch/delete)
//   - /api/waitlist/list (signup list used by the admin UI)
//
// The public invite lookup (/api/codes/lookup/:code) and the waitlist
// submission endpoint (/api/waitlist POST) are intentionally NOT matched —
// they're consumed by the customer-facing /wl and / pages.
//
// Credentials are intentionally obfuscated (base64-encoded "user:pass") so the
// literal password doesn't appear in the source. This is casual deterrence for
// a temp admin page, NOT real security — anyone can decode the string below.
// Replace with proper auth (env var + stronger check) before sharing broadly.
const EXPECTED_BASIC = "amVmZjpqZWZm";

export function proxy(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ") && header.slice(6) === EXPECTED_BASIC) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Wonderdog Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: [
    "/waitlist-codes",
    "/waitlist-codes/:path*",
    "/api/codes",
    "/api/codes/:code",
    "/api/waitlist/list",
  ],
};
