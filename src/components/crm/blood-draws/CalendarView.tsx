"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/crm/ui/card";
import { Input } from "@/components/crm/ui/input";
import { X } from "lucide-react";

interface VetTech {
  id: string;
  name: string;
  city: string;
  region?: string;
}

interface Appointment {
  id: string;
  techId: string;
  customerName: string;
  customerCity: string;
  startHour: number;
  startMin: number;
  durationMin: number;
}

interface Props {
  vetTechs: VetTech[];
  appointments: Appointment[];
  customers?: { id: string; full_name: string; city: string; state: string }[];
}

interface PendingSlot {
  techId: string;
  hour: number;
  min: number;
  leftPercent: number;
}

const START_HOUR = 7;
const END_HOUR = 16;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const ROW_HEIGHT = 56;
const SLOT_DURATION = 20;

export function CalendarView({ vetTechs, appointments: initialAppointments, customers = [] }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [pending, setPending] = useState<PendingSlot | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<typeof customers>([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cities = [...new Set(vetTechs.map((t) => t.city))];
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  function formatHour(h: number): string {
    if (h === 0 || h === 12) return "12pm";
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
  }

  function formatTime(h: number, m: number): string {
    const period = h >= 12 ? "pm" : "am";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${String(m).padStart(2, "0")}${period}`;
  }

  function getLeftPercent(hour: number, min: number): number {
    return ((hour - START_HOUR + min / 60) / TOTAL_HOURS) * 100;
  }

  function getWidthPercent(durationMin: number): number {
    return (durationMin / 60 / TOTAL_HOURS) * 100;
  }

  // Click on empty space in a row to create a pending slot
  const handleRowClick = useCallback(
    (techId: string, e: React.MouseEvent<HTMLDivElement>) => {
      if (pending) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      const totalMinutes = pct * TOTAL_HOURS * 60;

      // Snap to 20-minute increments
      const snapped = Math.round(totalMinutes / SLOT_DURATION) * SLOT_DURATION;
      const hour = START_HOUR + Math.floor(snapped / 60);
      const min = snapped % 60;

      if (hour >= END_HOUR) return;

      const leftPercent = getLeftPercent(hour, min);
      setPending({ techId, hour, min, leftPercent });
      setSearch("");
      setResults([]);

      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [pending],
  );

  // Search customers
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const q = search.toLowerCase();
    setResults(
      customers.filter((c) => c.full_name?.toLowerCase().includes(q)).slice(0, 6),
    );
  }, [search, customers]);

  // Book appointment
  async function bookAppointment(customer: { id: string; full_name: string; city: string; state: string }) {
    if (!pending) return;
    setSaving(true);

    try {
      const res = await fetch("/api/crm/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          vet_tech_id: pending.techId,
          start_hour: pending.hour,
          start_min: pending.min,
          duration_min: SLOT_DURATION,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments((prev) => [
          ...prev,
          {
            id: data.id,
            techId: pending.techId,
            customerName: customer.full_name,
            customerCity: customer.city,
            startHour: pending.hour,
            startMin: pending.min,
            durationMin: SLOT_DURATION,
          },
        ]);
      }
    } finally {
      setPending(null);
      setSearch("");
      setResults([]);
      setSaving(false);
    }
  }

  const slotWidth = getWidthPercent(SLOT_DURATION);

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {/* Left column -- tech names */}
        <div className="shrink-0 w-44 border-r bg-white z-10">
          <div className="h-10 border-b" />
          {cities.map((city) => {
            const techs = vetTechs.filter((t) => t.city === city);
            return (
              <div key={city}>
                <div className="h-8 flex items-center px-3 bg-muted/60 border-b">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {city}
                  </span>
                </div>
                {techs.map((tech) => (
                  <div
                    key={tech.id}
                    className="border-b flex items-center px-3"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div>
                      <p className="text-sm font-medium leading-tight">{tech.name}</p>
                      {tech.region && (
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">{tech.region}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right -- timeline grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Hour headers */}
            <div className="h-10 border-b flex relative">
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex-1 border-r last:border-r-0 flex items-end pb-1 px-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {formatHour(h)}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {cities.map((city) => {
              const techs = vetTechs.filter((t) => t.city === city);
              return (
                <div key={city}>
                  <div className="h-8 bg-muted/60 border-b" />

                  {techs.map((tech) => {
                    const techAppts = appointments.filter(
                      (a) => a.techId === tech.id,
                    );
                    const isPendingRow = pending?.techId === tech.id;

                    return (
                      <div
                        key={tech.id}
                        className="border-b relative cursor-crosshair"
                        style={{ height: ROW_HEIGHT }}
                        onClick={(e) => {
                          // Don't trigger if clicking on an appointment or the booking widget
                          const target = e.target as HTMLElement;
                          if (target.closest("[data-appt]") || target.closest("[data-booking]")) return;
                          handleRowClick(tech.id, e);
                        }}
                      >
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {hours.map((h) => (
                            <div
                              key={h}
                              className="flex-1 border-r last:border-r-0 border-dashed border-gray-100"
                            />
                          ))}
                        </div>

                        {/* Existing appointments */}
                        {techAppts.map((appt) => {
                          const left = getLeftPercent(appt.startHour, appt.startMin);
                          const width = getWidthPercent(appt.durationMin);

                          return (
                            <div
                              key={appt.id}
                              data-appt
                              className="group/appt absolute top-1.5 bottom-1.5"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                minWidth: 60,
                                zIndex: 1,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.zIndex = "20"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.zIndex = "1"; }}
                            >
                              <div className="h-full rounded-md bg-primary px-2.5 flex flex-col justify-center overflow-hidden cursor-pointer transition-all duration-150 group-hover/appt:w-max group-hover/appt:min-w-full group-hover/appt:shadow-lg group-hover/appt:px-3">
                                <span className="whitespace-nowrap leading-tight" style={{ fontSize: 11, fontWeight: 500, color: "#fff" }}>
                                  {appt.customerName}
                                </span>
                                <span className="whitespace-nowrap leading-tight" style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                                  {appt.customerCity}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Pending slot */}
                        {isPendingRow && pending && (
                          <div
                            data-booking
                            className="absolute top-1.5 bottom-1.5 z-30"
                            style={{
                              left: `${pending.leftPercent}%`,
                              width: `${slotWidth}%`,
                              minWidth: 60,
                            }}
                          >
                            {/* Gray placeholder block */}
                            <div className="h-full rounded-md border-2 border-dashed border-gray-300 bg-gray-100 flex flex-col justify-center px-2">
                              <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                                {formatTime(pending.hour, pending.min)}
                              </span>
                            </div>

                            {/* Booking popover */}
                            <div
                              className="absolute top-full mt-2 bg-white rounded-lg border shadow-xl z-40"
                              style={{ width: 280, left: 0, padding: 16 }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>
                                  Book at {formatTime(pending.hour, pending.min)}
                                </p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPending(null); }}
                                  style={{ padding: 2, cursor: "pointer", color: "#9CA3AF" }}
                                >
                                  <X style={{ width: 14, height: 14 }} />
                                </button>
                              </div>

                              <Input
                                ref={inputRef}
                                placeholder="Search customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={saving}
                                style={{ fontSize: 14, marginBottom: results.length > 0 ? 8 : 0 }}
                              />

                              {results.length > 0 && (
                                <div style={{ borderRadius: 8, border: "1px solid #E5E7EB", overflow: "hidden" }}>
                                  {results.map((c, i) => (
                                    <button
                                      key={c.id}
                                      onClick={(e) => { e.stopPropagation(); bookAppointment(c); }}
                                      disabled={saving}
                                      style={{
                                        display: "block",
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "10px 12px",
                                        fontSize: 14,
                                        cursor: "pointer",
                                        borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
                                        backgroundColor: "white",
                                        border: "none",
                                        borderBottom: i < results.length - 1 ? "1px solid #F3F4F6" : "none",
                                      }}
                                      onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = "#F9FAFB"; }}
                                      onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = "white"; }}
                                    >
                                      <span style={{ fontWeight: 500 }}>{c.full_name}</span>
                                      <span style={{ color: "#9CA3AF", marginLeft: 8, fontSize: 13 }}>
                                        {c.city}, {c.state}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Click-away to dismiss */}
      {pending && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setPending(null)}
          style={{ cursor: "default" }}
        />
      )}
    </Card>
  );
}
