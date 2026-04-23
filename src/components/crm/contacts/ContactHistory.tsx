"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/crm/ui/badge";
import { LIFECYCLE_STAGE_CONFIG } from "@/lib/crm/utils/constants";
import { formatRelativeTime } from "@/lib/crm/utils/formatters";
import { buildCustomerHistory, type HistoryCategory, type HistoryCustomer } from "@/lib/crm/utils/customer-history";
import type { LifecycleStage } from "@/lib/crm/types";

const CATEGORY_DOT: Record<HistoryCategory, string> = {
  signup: "#9CA3AF",
  invite: "#9CA3AF",
  app: "#6B7280",
  dog: "#10B981",
  vet_records: "#F59E0B",
  blood_draw: "hsl(var(--primary))",
  lab: "hsl(var(--primary))",
  vet_review: "#8B5CF6",
  delivery: "hsl(var(--primary))",
  sms: "#0EA5E9",
  note: "#D97706",
};

interface Props {
  customer: HistoryCustomer & {
    lifecycle_stage: string;
    last_contact_at: string | null;
  };
}

export function ContactHistory({ customer }: Props) {
  const [expanded, setExpanded] = useState(false);

  const events = useMemo(() => buildCustomerHistory(customer), [customer]);
  const newestFirst = useMemo(() => [...events].reverse(), [events]);

  const stage = customer.lifecycle_stage as LifecycleStage;
  const stageConfig = LIFECYCLE_STAGE_CONFIG[stage] ?? { label: stage, color: "#6B7280", variant: "muted" };
  const lastEvent = newestFirst[0];

  return (
    <div style={{ marginBottom: 28 }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 0,
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {expanded ? (
            <ChevronDown style={{ width: 14, height: 14, color: "#9CA3AF" }} />
          ) : (
            <ChevronRight style={{ width: 14, height: 14, color: "#9CA3AF" }} />
          )}
          <h4 style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            User History
          </h4>
        </div>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </button>

      {!expanded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {stageConfig.variant === "solid" ? (
              <Badge className="!bg-primary !text-primary-foreground">{stageConfig.label}</Badge>
            ) : stageConfig.variant === "dark" ? (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "#18181B", color: "#fff" }}>
                {stageConfig.label}
              </span>
            ) : stageConfig.variant === "outline" ? (
              <Badge variant="outline" className="!border-primary !text-primary !bg-white">{stageConfig.label}</Badge>
            ) : (
              <Badge variant="secondary" className="!text-gray-500">{stageConfig.label}</Badge>
            )}
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              signed up {formatRelativeTime(customer.created_at)}
            </span>
          </div>
          {lastEvent && (
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              Last activity: {lastEvent.label.toLowerCase()} · {formatRelativeTime(lastEvent.timestamp)}
            </p>
          )}
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: 16 }}>
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 6,
              bottom: 6,
              width: 1,
              backgroundColor: "#E5E7EB",
            }}
          />
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {newestFirst.map((event) => (
              <li key={event.id} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    position: "absolute",
                    left: -16,
                    top: 5,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    backgroundColor: CATEGORY_DOT[event.category],
                    border: "2px solid white",
                    boxShadow: "0 0 0 1px #E5E7EB",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#1F2937", fontWeight: 500 }}>{event.label}</span>
                  <span style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
                {event.detail && (
                  <span style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>
                    {event.detail}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
