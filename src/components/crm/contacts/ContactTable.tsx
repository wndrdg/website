"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/crm/ui/table";
import { Input } from "@/components/crm/ui/input";
import { Badge } from "@/components/crm/ui/badge";
import { Button } from "@/components/crm/ui/button";
import { Card } from "@/components/crm/ui/card";
import { Search, MessageCircle } from "lucide-react";
import { LIFECYCLE_STAGE_CONFIG } from "@/lib/crm/utils/constants";
import { formatRelativeTime, formatFutureDay, formatLabDate } from "@/lib/crm/utils/formatters";
import type { LifecycleStage } from "@/lib/crm/types";
import { ContactInspector } from "./ContactInspector";
import { AgentToggle } from "./AgentToggle";

interface ContactRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  lifecycle_stage: string;
  tags: string[];
  created_at: string;
  last_contact_at: string | null;
  notes_count: number;
  agent_enabled: boolean;
  human_requested: boolean;
  testflight_invited_at: string | null;
  app_onboarded_at: string | null;
  crm_dogs: {
    id: string;
    name: string;
    breed: string | null;
    age_years: number | null;
    weight_lbs: number | null;
    sex: string | null;
    has_vet_records: boolean;
    vet_clinic_name: string | null;
    vet_records_requested_at: string | null;
    vet_records_received_at: string | null;
    known_conditions: string[];
    medications: string[];
    supplements: string[];
    created_at: string;
  }[];
  crm_notes?: {
    id: string;
    body: string;
    is_pinned: boolean;
    created_by: string | null;
    created_at: string;
  }[];
  crm_sms_messages?: {
    id: string;
    direction: "inbound" | "outbound";
    body: string;
    sent_by: string | null;
    created_at: string;
  }[];
  crm_blood_draws?: {
    id: string;
    dog_id: string;
    status: string;
    scheduled_date: string | null;
    draw_completed_at: string | null;
    lab_results_received_at: string | null;
    vet_review_started_at: string | null;
    vet_review_completed_at: string | null;
    vet_approved: boolean | null;
    results_delivered_at: string | null;
    created_at: string;
  }[];
  crm_vet_records_requests?: {
    id: string;
    dog_id: string;
    vet_clinic_name: string | null;
    status: string;
    requested_at: string | null;
    received_at: string | null;
    last_follow_up_at: string | null;
    follow_up_count: number;
    created_at: string;
  }[];
}

export function ContactTable({ contacts }: { contacts: ContactRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = contacts.filter((c) => c.last_contact_at != null);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.crm_dogs?.some((d) => d.name.toLowerCase().includes(q))
      );
    }

    if (stageFilter !== "all") {
      result = result.filter((c) => c.lifecycle_stage === stageFilter);
    }

    return result;
  }, [contacts, search, stageFilter]);

  const stages = useMemo(() => {
    const s = new Set(contacts.map((c) => c.lifecycle_stage));
    return Array.from(s).sort();
  }, [contacts]);

  const selectedContact = selectedId ? contacts.find((c) => c.id === selectedId) ?? null : null;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => {
              const config = LIFECYCLE_STAGE_CONFIG[s as LifecycleStage];
              return (
                <option key={s} value={s}>
                  {config?.label ?? s}
                </option>
              );
            })}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, city, dog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Signed Up</TableHead>
              <TableHead>Dog</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-center">Vet Details</TableHead>
              <TableHead className="text-center">Vet Records</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const dog = c.crm_dogs?.[0];
              const stage = c.lifecycle_stage as LifecycleStage;
              const stageConfig = LIFECYCLE_STAGE_CONFIG[stage] ?? { label: stage, color: "#6B7280", variant: "muted" };

              return (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedId(c.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AgentToggle
                        customerId={c.id}
                        agentEnabled={c.agent_enabled}
                        humanRequested={c.human_requested}
                        onUpdate={() => router.refresh()}
                      />
                      <span className="relative inline-block shrink-0" style={{ width: 18, height: 18 }}>
                        {c.last_contact_at && (
                          c.notes_count > 0 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="absolute inset-0 m-auto" style={{ fill: "hsl(221.2 83.2% 53.3%)", stroke: "none" }}>
                              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                            </svg>
                          ) : (
                            <MessageCircle className="absolute inset-0 m-auto" style={{ width: 16, height: 16, color: "#18181B" }} />
                          )
                        )}
                      </span>
                      <p className="font-medium text-sm">{c.full_name ?? "---"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[c.city, c.state].filter(Boolean).join(", ") || "---"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(c.created_at)}
                  </TableCell>
                  <TableCell>
                    {dog ? (
                      <span className="text-sm">{dog.name}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {stageConfig.variant === "solid" ? (
                      <Badge className="text-xs whitespace-nowrap !bg-primary !text-primary-foreground">
                        {stageConfig.label}
                      </Badge>
                    ) : stageConfig.variant === "outline" ? (
                      <Badge variant="outline" className="text-xs whitespace-nowrap !border-primary !text-primary !bg-white">
                        {stageConfig.label}: {formatFutureDay(c.testflight_invited_at)}
                      </Badge>
                    ) : stageConfig.variant === "dark" && c.lifecycle_stage === "labs_pending" ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap" style={{ backgroundColor: "#6B7280", color: "#fff" }}>
                        {stageConfig.label}: {c.app_onboarded_at ? formatLabDate(c.app_onboarded_at) : ""}
                      </span>
                    ) : stageConfig.variant === "dark" ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap" style={{ backgroundColor: "#18181B", color: "#fff" }}>
                        {stageConfig.label}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-xs whitespace-nowrap !text-gray-500">
                        {stageConfig.label}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {dog?.vet_clinic_name ? (
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {dog?.vet_records_received_at ? (
                      <Badge className="text-xs !bg-primary !text-primary-foreground">
                        Received
                      </Badge>
                    ) : dog?.vet_records_requested_at ? (
                      <Badge variant="outline" className="text-xs whitespace-nowrap !border-primary !text-primary !bg-white">
                        Requested {formatRelativeTime(dog.vet_records_requested_at)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">---</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {c.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No contacts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Customer Inspector */}
      <ContactInspector
        customer={selectedContact}
        onClose={() => setSelectedId(null)}
        onUpdate={() => router.refresh()}
      />
    </div>
  );
}
