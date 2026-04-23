import { createServerClient } from "@/lib/crm/supabase/server";
import { list, get } from "@vercel/blob";
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

type CodeMeta = { description?: string; note?: string; created?: string };

async function fetchCodeMeta(codes: string[]): Promise<Record<string, CodeMeta>> {
  if (codes.length === 0) return {};
  const result: Record<string, CodeMeta> = {};
  try {
    const { blobs } = await list({ prefix: "codes/" });
    const wanted = new Set(codes);
    const relevant = blobs.filter((b) => {
      const filename = b.pathname.split("/").pop() || "";
      return wanted.has(filename.replace(".json", ""));
    });
    await Promise.all(
      relevant.map(async (b) => {
        try {
          const resp = await get(b.url, { access: "private" });
          if (!resp) return;
          const text = await new Response(resp.stream).text();
          const data = JSON.parse(text);
          if (typeof data?.code === "string") {
            result[data.code] = {
              description: data.description,
              note: data.note,
              created: data.created,
            };
          }
        } catch {
          /* ignore one-off failures */
        }
      }),
    );
    return result;
  } catch {
    return result;
  }
}

export default async function WaitlistPage() {
  const supabase = createServerClient();

  const { data: entries } = await supabase
    .from("crm_waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  const codes = Array.from(
    new Set((entries || []).map((e) => e.referral_code).filter(Boolean) as string[]),
  );
  const codeMeta = await fetchCodeMeta(codes);

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

  const formatDateTime = (v: string | null | undefined) => {
    if (!v) return "—";
    try {
      return new Date(v).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const dash = <span className="text-muted-foreground">—</span>;

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
          <CardTitle className="text-sm font-medium">
            All Entries <span className="text-muted-foreground font-normal">(most recent first)</span>
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
                  <TableHead>Breed</TableHead>
                  <TableHead className="text-center">SMS</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Invite Description</TableHead>
                  <TableHead>Invite Note</TableHead>
                  <TableHead>UTM Source</TableHead>
                  <TableHead>UTM Medium</TableHead>
                  <TableHead>UTM Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Invited At</TableHead>
                  <TableHead>Converted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries?.map((entry) => {
                  const meta = entry.referral_code ? codeMeta[entry.referral_code] : undefined;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatRelativeTime(entry.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        {[entry.first_name, entry.last_name].filter(Boolean).join(" ") || dash}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.email}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.phone || dash}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.city || dash}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.zip || dash}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.dog_name || dash}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.dog_breed || dash}</TableCell>
                      <TableCell className="text-center text-xs">
                        {entry.sms_consent ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.source ? (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${SOURCE_COLORS[entry.source] ?? ""}`}
                          >
                            {entry.source}
                          </Badge>
                        ) : dash}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {entry.referral_code ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {entry.referral_code}
                          </Badge>
                        ) : dash}
                      </TableCell>
                      <TableCell className="text-sm">{meta?.description || dash}</TableCell>
                      <TableCell className="text-sm italic text-muted-foreground">
                        {meta?.note || dash}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.utm_source || dash}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.utm_medium || dash}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{entry.utm_campaign || dash}</TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.status === "waiting" ? "outline" : "default"}
                          className="text-xs"
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-mono text-muted-foreground">
                        {entry.position ?? dash}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(entry.invited_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(entry.converted_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
