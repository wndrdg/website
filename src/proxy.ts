import { NextRequest, NextResponse } from "next/server";

// Two-host setup on a single Vercel deploy:
//   - wonder.dog        → marketing site + /waitlist-codes admin
//   - spark.wonder.dog  → CRM (dashboard, customers, messages, etc.)
// The subdomain is just a landing-UX convenience — routes are globally
// reachable but the CRM section is Basic Auth'd regardless of host.
//
// Credentials for both admin surfaces are base64-encoded "jeff:jeff". Casual
// deterrence only — replace with real auth before widening access.
const EXPECTED_BASIC = "amVmZjpqZWZm";

// Paths that require auth. The public invite lookup (/api/codes/lookup/...)
// and the public waitlist submission (/api/waitlist POST) are intentionally
// NOT included — they're consumed by the customer-facing /wl and / pages.
const AUTH_MATCHERS: RegExp[] = [
  /^\/waitlist-codes(\/|$)/,
  /^\/api\/codes(\/|$)/,
  /^\/api\/waitlist\/list\/?$/,
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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase();
  const isSpark = host.startsWith("spark.");

  // Clean landing on spark.wonder.dog → go straight into the CRM.
  if (isSpark && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Public invite lookup — used by /wl, never auth'd.
  if (/^\/api\/codes\/lookup\//.test(pathname)) {
    return NextResponse.next();
  }

  for (const rx of AUTH_MATCHERS) {
    if (rx.test(pathname)) {
      return requireBasicAuth(req) || NextResponse.next();
    }
  }

  return NextResponse.next();
}

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
