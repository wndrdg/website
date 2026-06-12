import { createHmac } from "crypto";

// ── env ──────────────────────────────────────────────────────────────
const LINEAR_WEBHOOK_SECRET = process.env.LINEAR_WEBHOOK_SECRET ?? "";
const OPENCLAW_WEBHOOK_URL  = process.env.OPENCLAW_WEBHOOK_URL  ?? "";   // e.g. https://<host>/hooks/agent
const OPENCLAW_HOOKS_TOKEN  = process.env.OPENCLAW_HOOKS_TOKEN  ?? "";

// ── helpers ──────────────────────────────────────────────────────────
function verifyLinearSignature(body: string, signature: string): boolean {
  if (!LINEAR_WEBHOOK_SECRET || !signature) return false;
  const hmac = createHmac("sha256", LINEAR_WEBHOOK_SECRET);
  hmac.update(body);
  const expected = hmac.digest("hex");
  return expected === signature;
}

/** Extract a concise message from a Linear Comment webhook event. */
function formatCommentEvent(payload: Record<string, unknown>): string | null {
  const action = payload.action as string | undefined;
  const type   = payload.type   as string | undefined;

  if (type !== "Comment" || action !== "create") return null;

  const data = payload.data as Record<string, unknown> | undefined;
  if (!data) return null;

  const body      = (data.body as string) ?? "";
  const userName  = ((data.user as Record<string, unknown>)?.name as string) ?? "Someone";
  const issueId   = (data.issueId as string) ?? "";

  // Grab issue identifier from the URL if available (e.g. WD-534)
  const url            = (data.url as string) ?? "";
  const issueMatch     = url.match(/\/issue\/([A-Z]+-\d+)/);
  const issueIdentifier = issueMatch?.[1] ?? issueId;

  // Fetch issue title from nested issue object if present
  const issue      = payload.issue as Record<string, unknown> | undefined;
  const issueTitle = (issue?.title as string) ?? "";

  const titlePart = issueTitle
    ? `${issueIdentifier}: ${issueTitle}`
    : issueIdentifier;

  return `[Linear ${titlePart}] ${userName} says: ${body}`;
}

// ── handler ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const rawBody   = await request.text();
  const signature = request.headers.get("linear-signature") ?? "";

  // 1. Verify Linear signature
  if (LINEAR_WEBHOOK_SECRET && !verifyLinearSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // 2. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // 3. Only relay Comment create events that mention @dignan
  const message = formatCommentEvent(payload);
  if (!message) {
    // Not a comment-create — ack silently
    return Response.json({ ok: true, skipped: true });
  }

  const body = ((payload.data as Record<string, unknown>)?.body as string) ?? "";
  const lowerBody = body.toLowerCase();

  // Skip if it doesn't mention @dignan (avoid relaying every comment)
  if (!lowerBody.includes("@dignan") && !lowerBody.includes("dignan")) {
    return Response.json({ ok: true, skipped: true, reason: "no @dignan mention" });
  }

  // 4. Relay to OpenClaw hooks/agent endpoint
  if (!OPENCLAW_WEBHOOK_URL) {
    console.error("[linear-webhook] OPENCLAW_WEBHOOK_URL not configured");
    return Response.json({ ok: false, error: "relay not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(OPENCLAW_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(OPENCLAW_HOOKS_TOKEN
          ? { Authorization: `Bearer ${OPENCLAW_HOOKS_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        message,
        name: "Linear",
        source: "linear",
        wakeMode: "now",
        sessionKey: "hook:linear",
      }),
    });

    const result = await res.text();
    return Response.json({ ok: true, relayed: true, status: res.status, result });
  } catch (err) {
    console.error("[linear-webhook] Relay failed:", err);
    return Response.json(
      { ok: false, error: "relay failed" },
      { status: 502 },
    );
  }
}

// Linear sends a HEAD or GET to verify the endpoint on setup
export async function GET() {
  return Response.json({ ok: true, service: "linear-webhook-relay" });
}
