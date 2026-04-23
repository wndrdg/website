import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Two-host setup on a single Vercel deploy:
//   - wonder.dog        → marketing + /waitlist-codes admin
//   - spark.wonder.dog  → CRM (dashboard, customers, messages, etc.)
//
// Two auth regimes:
//   - /waitlist-codes and its APIs → legacy HTTP Basic Auth (jeff:jeff)
//   - CRM surface (/dashboard etc. + /api/crm/*) → Google OAuth via Auth.js,
//     restricted to @wonder.dog accounts.
//
// The public invite lookup (/api/codes/lookup/:code) and waitlist submission
// (/api/waitlist POST) are intentionally NOT gated — they're consumed by the
// customer-facing /wl and / pages.

const EXPECTED_BASIC = "amVmZjpqZWZm"; // jeff:jeff, base64

const BASIC_AUTH_MATCHERS: RegExp[] = [
  /^\/waitlist-codes(\/|$)/,
  /^\/api\/codes(\/|$)/,
  /^\/api\/waitlist\/list\/?$/,
];

const CRM_MATCHERS: RegExp[] = [
  /^\/(dashboard|customers|messages|blood-draws|vet-records|vet-review|settings|waitlist)(\/|$)/,
  /^\/api\/crm\//,
];

function requireBasicAuth(req: NextRequest): NextResponse | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ") && header.slice(6) === EXPECTED_BASIC) {
    return null;
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Wonderdog Admin", charset="UTF-8"',
    },
  });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase();
  const isSpark = host.startsWith("spark.");

  // Clean landing on spark.wonder.dog → straight into the CRM.
  if (isSpark && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Public invite lookup — used by /wl, never auth'd.
  if (/^\/api\/codes\/lookup\//.test(pathname)) {
    return NextResponse.next();
  }

  // Legacy admin surface (Basic Auth)
  for (const rx of BASIC_AUTH_MATCHERS) {
    if (rx.test(pathname)) {
      return requireBasicAuth(req as unknown as NextRequest) || NextResponse.next();
    }
  }

  // CRM surface (Google OAuth via Auth.js)
  for (const rx of CRM_MATCHERS) {
    if (rx.test(pathname)) {
      if (!req.auth?.user?.email?.endsWith("@wonder.dog")) {
        // API routes → 401 JSON (clients handle redirect themselves)
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Pages → redirect to sign-in, remember where they were going
        const signin = new URL("/signin", req.url);
        signin.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signin);
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/waitlist-codes",
    "/waitlist-codes/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/customers",
    "/customers/:path*",
    "/waitlist",
    "/messages",
    "/messages/:path*",
    "/blood-draws",
    "/blood-draws/:path*",
    "/vet-records",
    "/vet-records/:path*",
    "/vet-review",
    "/vet-review/:path*",
    "/settings",
    "/settings/:path*",
    "/api/codes",
    "/api/codes/:path*",
    "/api/waitlist/list",
    "/api/crm/:path*",
  ],
};
