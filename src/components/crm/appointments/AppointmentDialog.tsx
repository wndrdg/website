"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/crm/ui/dialog";
import { Button } from "@/components/crm/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/crm/ui/input";
import { Textarea } from "@/components/crm/ui/textarea";
import { Badge } from "@/components/crm/ui/badge";

export type AppointmentType = "vcpr" | "blood_draw";

export type ExistingAppointment = {
  id: string;
  type: AppointmentType;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  vet_name: string | null;
  vet_tech_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

type Vet = { id: string; name: string; email: string | null; is_active: boolean };
type VetTech = { id: string; name: string; city: string | null; is_active: boolean };

function defaultScheduledAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function typeLabel(t: AppointmentType): string {
  return t === "vcpr" ? "VCPR" : "Blood draw";
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  /** Locks the type when opened from a specific button. */
  type: AppointmentType;
  /** When set, opens in view/cancel mode. When null, opens in create mode. */
  appointment: ExistingAppointment | null;
};

export function AppointmentDialog({
  open,
  onOpenChange,
  contactId,
  type,
  appointment,
}: Props) {
  const router = useRouter();
  const isView = appointment != null;

  // ─── Create-mode state ───────────────────────────────────────
  const [scheduledAt, setScheduledAt] = useState<string>(defaultScheduledAt());
  const [duration, setDuration] = useState<number>(30);
  const [vetId, setVetId] = useState<string>("");
  const [vetTechId, setVetTechId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [vets, setVets] = useState<Vet[]>([]);
  const [techs, setTechs] = useState<VetTech[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setScheduledAt(defaultScheduledAt());
      setDuration(30);
      setVetId("");
      setVetTechId("");
      setNotes("");
      setError(null);
    }
  }, [open, type]);

  // Load vets/techs on open (only needed for create mode, but cheap)
  useEffect(() => {
    if (!open || isView) return;
    (async () => {
      try {
        const res = await fetch("/api/crm/vets", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setVets(data.vets || []);
          setTechs(data.vet_techs || []);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [open, isView]);

  const activeVets = vets.filter((v) => v.is_active);
  const activeTechs = techs.filter((t) => t.is_active);

  const canCreate =
    !isView &&
    !!scheduledAt &&
    duration > 0 &&
    ((type === "vcpr" && vetId) || (type === "blood_draw" && vetTechId)) &&
    !submitting;

  const submitCreate = async () => {
    if (!canCreate) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contactId,
          type,
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_minutes: duration,
          vet_id: type === "vcpr" ? vetId : undefined,
          vet_tech_id: type === "blood_draw" ? vetTechId : undefined,
          notes: type === "vcpr" ? notes : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed (${res.status})`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const patchStatus = async (status: "cancelled" | "completed") => {
    if (!appointment) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed (${res.status})`);
      }
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            {isView ? `${typeLabel(type)} appointment` : `Book ${typeLabel(type)}`}
          </DialogTitle>
          <DialogDescription>
            {isView
              ? "Review or cancel this appointment."
              : `Schedule a ${typeLabel(type)} for this contact.`}
          </DialogDescription>
        </DialogHeader>

        {isView && appointment ? (
          // ─── View / cancel mode ─────────────────────────────────
          <div className="space-y-4">
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{formatWhen(appointment.scheduled_at)}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {appointment.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {appointment.duration_minutes} min · with{" "}
                <span className="text-foreground">
                  {appointment.vet_name || appointment.vet_tech_name || "—"}
                </span>
              </p>
              {appointment.notes ? (
                <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                  {appointment.notes}
                </p>
              ) : null}
            </div>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          // ─── Create mode ───────────────────────────────────────
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  When
                </Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Duration (min)
                </Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 30)}
                  className="mt-1"
                />
              </div>
            </div>

            {type === "vcpr" ? (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Assigned vet
                </Label>
                <select
                  value={vetId}
                  onChange={(e) => setVetId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">Choose a vet…</option>
                  {activeVets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                {activeVets.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-600">
                    No active vets in the system yet.
                  </p>
                ) : null}
              </div>
            ) : (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Assigned vet tech
                </Label>
                <select
                  value={vetTechId}
                  onChange={(e) => setVetTechId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">Choose a vet tech…</option>
                  {activeTechs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.city ? ` — ${t.city}` : ""}
                    </option>
                  ))}
                </select>
                {activeTechs.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-600">
                    No active vet techs in the system yet.
                  </p>
                ) : null}
              </div>
            )}

            {type === "vcpr" ? (
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notes
                </Label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything the vet should know…"
                  className="mt-1"
                />
              </div>
            ) : null}

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {isView ? (
            <>
              <Button
                variant="ghost"
                onClick={() => patchStatus("cancelled")}
                disabled={submitting}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Cancel appointment
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                  Close
                </Button>
                <Button onClick={() => patchStatus("completed")} disabled={submitting}>
                  Mark complete
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={submitCreate} disabled={!canCreate}>
                {submitting ? "Booking…" : "Book"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
