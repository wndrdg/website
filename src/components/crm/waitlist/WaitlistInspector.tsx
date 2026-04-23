"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/crm/ui/sheet";
import { Badge } from "@/components/crm/ui/badge";
import { Separator } from "@/components/crm/ui/separator";
import { formatRelativeTime } from "@/lib/crm/utils/formatters";
import type { WaitlistEntry, CodeMeta } from "./types";

function formatDateTime(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-foreground ${
          mono ? "font-mono" : ""
        } break-words`}
      >
        {value || <span className="text-muted-foreground">—</span>}
      </p>
    </div>
  );
}

export function WaitlistInspector({
  entry,
  codeMeta,
  open,
  onClose,
}: {
  entry: WaitlistEntry | null;
  codeMeta?: CodeMeta;
  open: boolean;
  onClose: () => void;
}) {
  const fullName = entry
    ? [entry.first_name, entry.last_name].filter(Boolean).join(" ") || entry.email
    : "";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[90vw] overflow-y-auto p-0 sm:max-w-[520px]">
        {entry ? (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-background px-6 py-5">
              <SheetTitle className="text-xl font-semibold leading-tight">
                {fullName}
              </SheetTitle>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs capitalize">
                  {entry.status}
                </Badge>
                <span>·</span>
                <span>Joined {formatRelativeTime(entry.created_at)}</span>
                {entry.position != null ? (
                  <>
                    <span>·</span>
                    <span className="font-mono">#{entry.position}</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-6 px-6 py-6">
              {/* Contact */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Field label="Email" value={entry.email} />
                  <Field label="Phone" value={entry.phone} />
                  <Field
                    label="SMS Consent"
                    value={
                      entry.sms_consent ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )
                    }
                  />
                </div>
              </section>

              <Separator />

              {/* Location */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Location
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Field label="City" value={entry.city} />
                  <Field label="Zip" value={entry.zip} />
                </div>
              </section>

              <Separator />

              {/* Dog */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Dog
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Field label="Name" value={entry.dog_name} />
                  <Field label="Breed" value={entry.dog_breed} />
                </div>
              </section>

              <Separator />

              {/* Attribution */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Attribution
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Field label="Source" value={entry.source} />
                  <Field label="Invite Code" value={entry.referral_code} mono />
                  <Field
                    label="Invite Description"
                    value={codeMeta?.description}
                  />
                  <Field label="Invite Note" value={codeMeta?.note} />
                  <Field label="UTM Source" value={entry.utm_source} />
                  <Field label="UTM Medium" value={entry.utm_medium} />
                  <Field label="UTM Campaign" value={entry.utm_campaign} />
                </div>
              </section>

              <Separator />

              {/* Lifecycle */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lifecycle
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <Field label="Status" value={entry.status} />
                  <Field
                    label="Position"
                    value={entry.position != null ? String(entry.position) : null}
                    mono
                  />
                  <Field label="Joined" value={formatDateTime(entry.created_at)} />
                  <Field label="Invited At" value={formatDateTime(entry.invited_at)} />
                  <Field label="Converted At" value={formatDateTime(entry.converted_at)} />
                </div>
              </section>

              <Separator />

              {/* IDs */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  IDs
                </h3>
                <div className="mt-3 space-y-3">
                  <Field label="Waitlist ID" value={entry.id} mono />
                  <Field label="Customer ID" value={entry.customer_id} mono />
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
