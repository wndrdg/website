import { NextRequest, NextResponse } from "next/server";

// HTTP Basic Auth for the admin surface:
//   - /waitlist-codes (the admin UI)
//   - /api/codes (list/create) and /api/codes/:code (patch/delete)
//   - /api/waitlist/list (signup list used by the admin UI)
//
// The public invite lookup (/api/codes/lookup/:code) and waitlist submission
// (/api/waitlist) are intentionally NOT matched — they're used by the
// customer-facing /wl and / pages.
//
// Credentials: any username, password must equal process.env.ADMIN_PASSWORD.
// If the env var is unset (e.g. local dev without config), auth is skipped so
// the page stays usable.
export function proxy(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const provided = decoded.slice(decoded.indexOf(":") + 1);
      if (provided === password) return NextResponse.next();
    } catch {
      // fall through to 401
    }
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
