"use client";

import { useEffect } from "react";

export default function CrmError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CRM error boundary:", error);
  }, [error]);

  const msg = error?.message || "";
  const missingSupabase = /Missing Supabase environment variables/i.test(msg);

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-lg border border-border bg-background p-6 text-foreground">
      <h1 className="text-lg font-semibold">CRM is not configured yet</h1>

      {missingSupabase ? (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The server is missing Supabase environment variables, so this page
            can&apos;t read the database.
          </p>
          <p>
            Go to <strong>Vercel → this project → Settings → Environment
            Variables</strong> and add:
          </p>
          <ul className="ml-5 list-disc">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            <li><code>SUPABASE_SERVICE_ROLE_KEY</code></li>
          </ul>
          <p>
            Then trigger a redeploy (Deployments tab → latest → &ldquo;Redeploy&rdquo;
            — env var changes don&apos;t auto-deploy).
          </p>
          <p>
            Check <a
              className="underline"
              href="/api/crm/_diag"
              target="_blank"
              rel="noreferrer"
            >
              /api/crm/_diag
            </a> to see which vars Vercel actually has.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Something failed while rendering this page. The error was:
          </p>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">
            {msg || "Unknown error"}
          </pre>
          {error?.digest ? (
            <p className="text-xs">Vercel digest: <code>{error.digest}</code></p>
          ) : null}
          <p>
            Check <a
              className="underline"
              href="/api/crm/_diag"
              target="_blank"
              rel="noreferrer"
            >
              /api/crm/_diag
            </a> to confirm env vars are set.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
      >
        Try again
      </button>
    </div>
  );
}
