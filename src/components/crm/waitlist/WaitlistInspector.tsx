"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/crm/ui/sheet";
import { Badge } from "@/components/crm/ui/badge";
import { Button } from "@/components/crm/ui/button";
import { Separator } from "@/components/crm/ui/separator";
import { BookAppointmentDialog } from "@/components/crm/appointments/BookAppointmentDialog";
import { formatRelativeTime } from "@/lib/crm/utils/formatters";
import type { WaitlistContact, CodeMeta } from "./types";

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
  const empty = value === null || value === undefined || value === "";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""} break-words`}
      >
        {empty ? <span className="text-muted-foreground">—</span> : value}
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
  entry: WaitlistContact | null;
  codeMeta?: CodeMeta;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [bookType, setBookType] = useState<"vcpr" | "blood_draw" | null>(null);
  const [togglingContact, setTogglingContact] = useState(false);

  if (!entry) {
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="w-[90vw] p-0 sm:max-w-[520px]" />
      </Sheet>
    );
  }

  const fullName =
    [entry.first_name, entry.last_name].filter(Boolean).join(" ") || entry.email || "Unknown";
  const contacted = entry.last_contact_at != null;

  const toggleContacted = async () => {
    setTogglingContact(true);
    try {
      await fetch("/api/crm/contacts/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: entry.id, open: !contacted }),
      });
      router.refresh();
    } finally {
      setTogglingContact(false);
    }
  };

  const addressLines = [
    [entry.street, entry.apt].filter(Boolean).join(" "),
    [entry.city, entry.state].filter(Boolean).join(", "),
    entry.zip,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="w-[90vw] overflow-y-auto p-0 sm:max-w-[560px]">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b bg-background px-6 py-5">
            <SheetTitle className="text-xl font-semibold leading-tight">{fullName}</SheetTitle>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">Waitlist</Badge>
              {entry.is_beta ? <Badge variant="outline" className="text-xs">Beta</Badge> : null}
              {entry.is_customer ? <Badge variant="outline" className="text-xs">Customer</Badge> : null}
              <span>·</span>
              <span>Joined {formatRelativeTime(entry.created_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 border-b bg-muted/20 px-6 py-4">
            <Button
              variant={contacted ? "secondary" : "default"}
              size="sm"
              onClick={toggleContacted}
              disabled={togglingContact}
              title={
                contacted
                  ? `Mark as not yet contacted (clear last_contact_at)`
                  : `Mark as contacted (set last_contact_at = now)`
              }
            >
              {contacted ? "Contacted ✓" : "Mark contacted"}
            </Button>
            <Button
              variant={entry.has_vcpr ? "secondary" : "default"}
              size="sm"
              onClick={() => setBookType("vcpr")}
            >
              {entry.has_vcpr ? "VCPR booked ✓" : "Book VCPR"}
            </Button>
            <Button
              variant={entry.has_blood_draw ? "secondary" : "default"}
              size="sm"
              onClick={() => setBookType("blood_draw")}
            >
              {entry.has_blood_draw ? "Draw booked ✓" : "Book draw"}
            </Button>
          </div>

          {/* Body */}
          <div className="space-y-6 px-6 py-6">
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
                <Field
                  label="Last contact"
                  value={entry.last_contact_at ? formatDateTime(entry.last_contact_at) : "Never"}
                />
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Address
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <Field label="Street" value={entry.street} />
                <Field label="Apt" value={entry.apt} />
                <Field label="City" value={entry.city} />
                <Field label="State" value={entry.state} />
                <Field label="Zip" value={entry.zip} />
              </div>
              {addressLines ? (
                <p className="mt-3 text-xs text-muted-foreground">{addressLines}</p>
              ) : null}
            </section>

            <Separator />

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

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attribution
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <Field label="Source" value={entry.waitlist_source} />
                <Field label="Invite Code" value={entry.referral_code} mono />
                <Field label="Invite Description" value={codeMeta?.description} />
                <Field label="Invite Note" value={codeMeta?.note} />
                <Field label="UTM Source" value={entry.utm_source} />
                <Field label="UTM Medium" value={entry.utm_medium} />
                <Field label="UTM Campaign" value={entry.utm_campaign} />
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lifecycle
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <Field label="Lifecycle stage" value={entry.lifecycle_stage} />
                <Field
                  label="States"
                  value={[
                    entry.is_waitlist ? "waitlist" : null,
                    entry.is_beta ? "beta" : null,
                    entry.is_customer ? "customer" : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || null}
                />
              </div>
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                IDs
              </h3>
              <div className="mt-3 space-y-3">
                <Field label="Contact ID" value={entry.id} mono />
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <BookAppointmentDialog
        open={bookType !== null}
        onOpenChange={(o) => !o && setBookType(null)}
        contactId={entry.id}
        initialType={bookType ?? "vcpr"}
      />
    </>
  );
}
