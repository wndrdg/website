"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/crm/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/crm/ui/tabs";
import { WaitlistList } from "./WaitlistList";
import { WaitlistMap } from "./WaitlistMap";
import { WaitlistInspector } from "./WaitlistInspector";
import type { WaitlistContact, CodeMeta } from "./types";

export function WaitlistBrowser({
  entries,
  codeMeta,
}: {
  entries: WaitlistContact[];
  codeMeta: Record<string, CodeMeta>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  const selected = useMemo(
    () => (selectedId ? entries.find((e) => e.id === selectedId) ?? null : null),
    [selectedId, entries],
  );
  const selectedMeta = selected?.referral_code ? codeMeta[selected.referral_code] : undefined;

  const contacted = entries.filter((e) => e.last_contact_at != null).length;
  const needsOutreach = entries.length - contacted;
  const withVcpr = entries.filter((e) => e.has_vcpr).length;
  const withDraw = entries.filter((e) => e.has_blood_draw).length;

  const stats = [
    { label: "Needs outreach", value: needsOutreach },
    { label: "Contacted", value: contacted },
    { label: "VCPR booked", value: withVcpr },
    { label: "Blood draw booked", value: withDraw },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Waitlist</h1>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")}>
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <WaitlistList entries={entries} codeMeta={codeMeta} onSelect={setSelectedId} />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <WaitlistMap entries={entries} onSelect={setSelectedId} />
        </TabsContent>
      </Tabs>

      <WaitlistInspector
        entry={selected}
        codeMeta={selectedMeta}
        open={!!selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
