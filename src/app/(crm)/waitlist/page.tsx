import { createServerClient } from "@/lib/crm/supabase/server";
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

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
  const supabase = createServerClient();

  const { data: entries } = await supabase
    .from("crm_waitlist")
    .select("*")
    .order("position", { ascending: true });

  const waiting = entries?.filter((e) => e.status === "waiting") ?? [];
  const invited = entries?.filter((e) => e.status === "invited") ?? [];
  const converted = entries?.filter((e) => e.status === "converted") ?? [];

  const stats = [
    { label: "Total Waiting", value: waiting.length },
    { label: "Invited", value: invited.length },
    { label: "Converted", value: converted.length },
    { label: "Total Entries", value: entries?.length ?? 0 },
  ];

  const SOURCE_COLORS: Record<string, string> = {
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Entries</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Dog</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {entry.position}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {entry.first_name} {entry.last_name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.email}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {[entry.city, entry.zip].filter(Boolean).join(", ")}
                </TableCell>
                <TableCell className="text-sm">
                  {entry.dog_name ? (
                    <span>
                      {entry.dog_name}{" "}
                      <span className="text-muted-foreground text-xs">{entry.dog_breed}</span>
                    </span>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  {entry.source && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${SOURCE_COLORS[entry.source] ?? ""}`}
                    >
                      {entry.source}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={entry.status === "waiting" ? "outline" : "default"}
                    className="text-xs"
                  >
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeTime(entry.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
