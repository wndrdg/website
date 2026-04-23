"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/crm/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/crm/ui/tabs";
import { WaitlistList } from "./WaitlistList";
import { WaitlistMap } from "./WaitlistMap";
import { WaitlistInspector } from "./WaitlistInspector";
import type { WaitlistEntry, CodeMeta } from "./types";

export function WaitlistBrowser({
  entries,
  codeMeta,
}: {
  entries: WaitlistEntry[];
  codeMeta: Record<string, CodeMeta>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  const selectedEntry = useMemo(
    () => (selectedId ? entries.find((e) => e.id === selectedId) ?? null : null),
    [selectedId, entries],
  );
  const selectedMeta = selectedEntry?.referral_code
    ? codeMeta[selectedEntry.referral_code]
    : undefined;

  const waiting = entries.filter((e) => e.status === "waiting").length;
  const invited = entries.filter((e) => e.status === "invited").length;
  const converted = entries.filter((e) => e.status === "converted").length;

  const stats = [
    { label: "Total Waiting", value: waiting },
    { label: "Invited", value: invited },
    { label: "Converted", value: converted },
    { label: "Total Entries", value: entries.length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Waitlist</h1>

      {/* Stats */}
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
          <WaitlistList
            entries={entries}
            codeMeta={codeMeta}
            onSelect={setSelectedId}
          />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <WaitlistMap entries={entries} onSelect={setSelectedId} />
        </TabsContent>
      </Tabs>

      <WaitlistInspector
        entry={selectedEntry}
        codeMeta={selectedMeta}
        open={!!selectedEntry}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
