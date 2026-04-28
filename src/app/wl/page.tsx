import { Suspense } from "react";
import { getAllInviteCodes } from "@/lib/crm/invite-codes";
import { WaitlistInviteInner } from "./_inner";

export default async function WaitlistInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const sp = await searchParams;
  const inviteCode = (sp.invite || "").toUpperCase();

  // Look up the code server-side so the golden ticket can render in the
  // initial HTML. No client-side fetch round-trip, no flash of "Verifying…".
  let codeDescription: string | null = null;
  let codeValid: boolean | null = inviteCode ? null : false;
  if (inviteCode) {
    if (/^[A-Z0-9]{4}$/.test(inviteCode)) {
      try {
        const codes = await getAllInviteCodes();
        const meta = codes[inviteCode];
        if (meta) {
          codeDescription = meta.description ?? "";
          codeValid = true;
        } else {
          codeValid = false;
        }
      } catch {
        codeValid = false;
      }
    } else {
      codeValid = false;
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#003A45] text-white/70">
          Loading…
        </div>
      }
    >
      <WaitlistInviteInner
        initialInviteCode={inviteCode}
        initialCodeDescription={codeDescription}
        initialCodeValid={codeValid}
      />
    </Suspense>
  );
}

