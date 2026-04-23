"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/crm/ui/card";
import { Badge } from "@/components/crm/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/crm/ui/table";
import { formatRelativeTime } from "@/lib/crm/utils/formatters";
import type { WaitlistContact, CodeMeta } from "./types";

const SOURCE_COLORS: Record<string, string> = {
  website: "bg-teal-100 text-teal-700",
  instagram: "bg-pink-100 text-pink-700",
  referral: "bg-green-100 text-green-700",
  tiktok: "bg-purple-100 text-purple-700",
  google: "bg-blue-100 text-blue-700",
  friend: "bg-amber-100 text-amber-700",
  pr: "bg-cyan-100 text-cyan-700",
  organic: "bg-gray-100 text-gray-700",
  facebook: "bg-indigo-100 text-indigo-700",
  podcast: "bg-orange-100 text-orange-700",
  vet_referral: "bg-emerald-100 text-emerald-700",
};

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={
        on
          ? "inline-flex items-center gap-1 text-xs font-medium text-green-700"
          : "inline-flex items-center gap-1 text-xs text-muted-foreground"
      }
      title={label}
    >
      {on ? "✓" : "—"}
    </span>
  );
}

export function WaitlistList({
  entries,
  codeMeta,
  onSelect,
}: {
  entries: WaitlistContact[];
  codeMeta: Record<string, CodeMeta>;
  onSelect: (id: string) => void;
}) {
  const dash = <span className="text-muted-foreground">—</span>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Waitlist contacts{" "}
          <span className="font-normal text-muted-foreground">
            (most recent first — click a row for details)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joined</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Zip</TableHead>
                <TableHead>Dog</TableHead>
                <TableHead className="text-center">SMS OK</TableHead>
                <TableHead className="text-center">Contacted</TableHead>
                <TableHead className="text-center">VCPR</TableHead>
                <TableHead className="text-center">Blood Draw</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Invite Code</TableHead>
                <TableHead>Invite Description</TableHead>
                <TableHead>Invite Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => {
                const meta = e.referral_code ? codeMeta[e.referral_code] : undefined;
                const contacted = e.last_contact_at != null;
                return (
                  <TableRow
                    key={e.id}
                    onClick={() => onSelect(e.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatRelativeTime(e.created_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {[e.first_name, e.last_name].filter(Boolean).join(" ") || dash}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{e.email || dash}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{e.phone || dash}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{e.city || dash}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{e.zip || dash}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {e.dog_name || dash}
                      {e.dog_breed ? (
                        <span className="ml-1 text-xs text-muted-foreground">{e.dog_breed}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-center">
                      <Flag on={!!e.sms_consent} label="SMS consent" />
                    </TableCell>
                    <TableCell className="text-center">
                      {contacted ? (
                        <span
                          className="text-xs text-green-700"
                          title={`Contacted ${formatRelativeTime(e.last_contact_at!)}`}
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600" title="Needs outreach">
                          ○
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Flag on={e.has_vcpr} label="VCPR appointment" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Flag on={e.has_blood_draw} label="Blood draw appointment" />
                    </TableCell>
                    <TableCell>
                      {e.waitlist_source ? (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${SOURCE_COLORS[e.waitlist_source] ?? ""}`}
                        >
                          {e.waitlist_source}
                        </Badge>
                      ) : (
                        dash
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {e.referral_code ? (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {e.referral_code}
                        </Badge>
                      ) : (
                        dash
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{meta?.description || dash}</TableCell>
                    <TableCell className="text-sm italic text-muted-foreground">
                      {meta?.note || dash}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
