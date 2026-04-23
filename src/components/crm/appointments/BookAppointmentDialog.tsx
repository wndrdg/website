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

type AppointmentType = "vcpr" | "blood_draw";

type Vet = { id: string; name: string; email: string | null; is_active: boolean };
type VetTech = { id: string; name: string; city: string | null; is_active: boolean };

function defaultScheduledAt(): string {
  // Next business morning at 10am local, formatted for <input type="datetime-local">.
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookAppointmentDialog({
  open,
  onOpenChange,
  contactId,
  initialType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  initialType: AppointmentType;
}) {
  const router = useRouter();
  const [type, setType] = useState<AppointmentType>(initialType);
  const [scheduledAt, setScheduledAt] = useState<string>(defaultScheduledAt());
  const [duration, setDuration] = useState<number>(30);
  const [vetId, setVetId] = useState<string>("");
  const [vetTechId, setVetTechId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [vets, setVets] = useState<Vet[]>([]);
  const [techs, setTechs] = useState<VetTech[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync type when the parent passes a different initialType on reopen
  useEffect(() => {
    if (open) {
      setType(initialType);
      setScheduledAt(defaultScheduledAt());
      setNotes("");
      setVetId("");
      setVetTechId("");
      setError(null);
    }
  }, [open, initialType]);

  // Fetch vets and vet techs once on first open
  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const activeVets = vets.filter((v) => v.is_active);
  const activeTechs = techs.filter((t) => t.is_active);

  const canSubmit =
    !!scheduledAt &&
    duration > 0 &&
    ((type === "vcpr" && vetId) || (type === "blood_draw" && vetTechId)) &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Book appointment</DialogTitle>
          <DialogDescription>
            Schedule a {type === "vcpr" ? "VCPR" : "blood draw"} for this contact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Type</Label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setType("vcpr")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  type === "vcpr"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                VCPR
              </button>
              <button
                type="button"
                onClick={() => setType("blood_draw")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  type === "blood_draw"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                Blood draw
              </button>
            </div>
          </div>

          {/* Date + Duration */}
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

          {/* Assignee */}
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
                  No active vets in the system yet. Add one in Settings.
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

          {/* Notes (VCPR only) */}
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {submitting ? "Booking…" : "Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
