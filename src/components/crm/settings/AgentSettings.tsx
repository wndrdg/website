"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import { Bot, BotOff } from "lucide-react";

const PLAYS: { id: string; name: string; trigger: string; description: string }[] = [
  {
    id: "welcome",
    name: "Welcome",
    trigger: "lifecycle → onboarded",
    description: "Greet new customer, introduce Wonder Dog, set expectations.",
  },
  {
    id: "service_area",
    name: "Service-area check",
    trigger: "after welcome reply",
    description: "Confirm zip, decide in-area vs waitlist path.",
  },
  {
    id: "vet_records_intake",
    name: "Vet records intake",
    trigger: "in-area customer",
    description: "Collect clinic name/phone, initiate records request.",
  },
  {
    id: "vet_records_followup",
    name: "Vet records follow-up",
    trigger: "3 days no records",
    description: "Check in on vet, offer to move forward with blood draw.",
  },
  {
    id: "blood_draw_offer",
    name: "Blood draw offer",
    trigger: "in-area + records stalled",
    description: "Propose blood draw appointment with local vet tech.",
  },
  {
    id: "waitlist_add",
    name: "Waitlist placement",
    trigger: "out-of-area customer",
    description: "Explain service area, add to waitlist, set expectations.",
  },
  {
    id: "human_handoff",
    name: "Human handoff",
    trigger: "confusion/complaint detected",
    description: "Flag for live agent, pause agent, mark human_requested.",
  },
];

export function AgentSettings({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      await fetch("/api/crm/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Global Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {enabled ? (
                  <Bot className="h-4 w-4 !text-primary" />
                ) : (
                  <BotOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {enabled ? "Agent is running" : "Agent is paused"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Global kill switch. When off, no plays run for any customer, regardless of per-customer toggle.
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              disabled={isPending}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
              style={{
                backgroundColor: enabled ? "hsl(221.2 83.2% 53.3%)" : "#D1D5DB",
              }}
            >
              <span
                className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                style={{
                  transform: enabled ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Plays</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {PLAYS.map((play) => (
              <div key={play.id} className="flex items-center justify-between px-6 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{play.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">{play.trigger}</span> — {play.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground italic">Not yet wired</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
