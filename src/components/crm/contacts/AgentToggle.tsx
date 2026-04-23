"use client";

import { useState, useTransition } from "react";
import { Bot, BotOff, X } from "lucide-react";
import { Button } from "@/components/crm/ui/button";

interface Props {
  customerId: string;
  agentEnabled: boolean;
  humanRequested: boolean;
  variant?: "icon" | "button";
  onUpdate?: () => void;
}

export function AgentToggle({
  customerId,
  agentEnabled,
  humanRequested,
  variant = "icon",
  onUpdate,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [hover, setHover] = useState(false);

  const orange = !agentEnabled && humanRequested;

  const call = (body: Record<string, unknown>) => {
    startTransition(async () => {
      await fetch("/api/crm/customers/agent-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: customerId, ...body }),
      });
      onUpdate?.();
    });
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    call({ agent_enabled: !agentEnabled });
  };

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    call({ human_requested: false });
  };

  if (variant === "button") {
    const Icon = agentEnabled ? Bot : BotOff;
    const label = orange ? "Live Agent" : agentEnabled ? "Agent On" : "Agent Off";

    const btnStyle: React.CSSProperties = orange
      ? { borderColor: "#F97316", color: "#F97316", backgroundColor: "#FFF7ED" }
      : {};

    return (
      <div
        className="relative inline-flex items-center"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Button
          type="button"
          variant={agentEnabled ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          style={btnStyle}
          disabled={isPending}
          onClick={toggle}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Button>
        {orange && hover && (
          <button
            type="button"
            onClick={dismiss}
            title="Mark as responded"
            className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full shadow-sm"
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#F97316",
              color: "#fff",
              border: "1.5px solid #fff",
            }}
          >
            <X style={{ width: 10, height: 10 }} strokeWidth={3} />
          </button>
        )}
      </div>
    );
  }

  const color = agentEnabled
    ? "hsl(221.2 83.2% 53.3%)"
    : orange
      ? "#F97316"
      : "#9CA3AF";

  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: 18, height: 18 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={toggle}
        title={
          orange
            ? "Live agent requested — click to toggle agent"
            : agentEnabled
              ? "Agent on — click to disable"
              : "Agent off — click to enable"
        }
        className="inline-flex items-center justify-center rounded-sm transition-opacity"
        style={{ width: 18, height: 18, opacity: isPending ? 0.5 : 1 }}
      >
        {agentEnabled ? (
          <Bot style={{ width: 16, height: 16, color }} />
        ) : (
          <BotOff style={{ width: 16, height: 16, color }} />
        )}
      </button>
      {orange && hover && (
        <button
          type="button"
          onClick={dismiss}
          title="Mark as responded (clear request)"
          className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: "#F97316",
            color: "#fff",
          }}
        >
          <X style={{ width: 9, height: 9 }} strokeWidth={3} />
        </button>
      )}
    </span>
  );
}
