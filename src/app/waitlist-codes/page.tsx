"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface InviteCode {
  code: string;
  description: string;
  note?: string;
  created: string;
  signups: number;
}

interface AddressParts {
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface Dog {
  name?: string;
  breed?: string;
  weight?: string;
  age?: string;
}

interface Signup {
  date?: string;
  email?: string;
  name?: string;
  phone?: string;
  zip?: string;
  address?: string;
  addressParts?: AddressParts;
  smsConsent?: boolean;
  contactPreference?: string;
  invite_code?: string;
  dogs?: Dog[];
}

type Tab = "codes" | "waitlist";

export default function WaitlistCodes() {
  const [tab, setTab] = useState<Tab>("codes");

  /* -------------------- Invite code state -------------------- */
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Create dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCode, setNewCode] = useState<InviteCode | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit dialog
  const [editingCode, setEditingCode] = useState<InviteCode | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete dialog
  const [deletingCode, setDeletingCode] = useState<InviteCode | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  /* -------------------- Waitlist state -------------------- */
  const [signups, setSignups] = useState<Signup[]>([]);
  const [waitlistFetching, setWaitlistFetching] = useState(false);
  const [waitlistLoaded, setWaitlistLoaded] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  /* -------------------- Code fetchers -------------------- */
  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/codes");
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (err) {
      console.error("Failed to fetch codes:", err);
    } finally {
      setFetching(false);
    }
  };

  const fetchSignups = async () => {
    setWaitlistFetching(true);
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist/list", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSignups(data.entries || []);
      setWaitlistLoaded(true);
    } catch (err) {
      console.error("Failed to fetch waitlist:", err);
      setWaitlistError("Failed to load waitlist.");
    } finally {
      setWaitlistFetching(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  // Lazy-load the waitlist the first time the tab is opened.
  useEffect(() => {
    if (tab === "waitlist" && !waitlistLoaded && !waitlistFetching) {
      fetchSignups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* -------------------- Code actions -------------------- */
  const createCode = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCode(data.code);
        setShowCreateDialog(true);
        setDescription("");
        setNote("");
        fetchCodes();
      }
    } catch (err) {
      console.error("Failed to create code:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingCode || !editDescription.trim()) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/codes/${editingCode.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editDescription.trim(),
          note: editNote, // blank string clears the note server-side
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCode(null);
        fetchCodes();
      }
    } catch (err) {
      console.error("Failed to update code:", err);
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCode) return;
    setDeleteSaving(true);
    try {
      const res = await fetch(`/api/codes/${deletingCode.code}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeletingCode(null);
        fetchCodes();
      }
    } catch (err) {
      console.error("Failed to delete code:", err);
    } finally {
      setDeleteSaving(false);
    }
  };

  const getInviteUrl = (code: string) => `https://wonder.dog/wl?invite=${code}`;

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(getInviteUrl(code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* -------------------- CSV export -------------------- */
  const csvHref = useMemo(() => {
    if (signups.length === 0) return null;
    const csv = signupsToCsv(signups);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [signups]);

  const csvFilename = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `wonderdog-waitlist-${yyyy}-${mm}-${dd}.csv`;
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Waitlist Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Manage invite codes and review waitlist signups.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-gray-200">
          <TabButton active={tab === "codes"} onClick={() => setTab("codes")}>
            Invite Codes
          </TabButton>
          <TabButton active={tab === "waitlist"} onClick={() => setTab("waitlist")}>
            Waitlist
            {waitlistLoaded ? (
              <span className="ml-2 text-xs text-gray-400">({signups.length})</span>
            ) : null}
          </TabButton>
        </div>

        {tab === "codes" ? (
          <>
            {/* Create Code */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base">Create New Code</CardTitle>
                <CardDescription>Generate an invite link to share with someone. We&apos;ll track signups from their link.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="description" className="text-sm text-gray-600">
                      Description <span className="text-gray-400">(shown on the invite)</span>
                    </Label>
                    <Input
                      id="description"
                      placeholder="e.g. Pat's friend Danny"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createCode()}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note" className="text-sm text-gray-600">
                      Private note <span className="text-gray-400">(internal only)</span>
                    </Label>
                    <Input
                      id="note"
                      placeholder="e.g. Met at demo day, follow up next week"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && createCode()}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={createCode} disabled={loading || !description.trim()}>
                    {loading ? "Creating..." : "Create Code"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Separator className="mb-8" />

            {/* Codes Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Codes</CardTitle>
                <CardDescription>{codes.length} codes created</CardDescription>
              </CardHeader>
              <CardContent>
                {fetching ? (
                  <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
                ) : codes.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No codes yet. Create one above.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Private note</TableHead>
                        <TableHead className="w-[110px]">Created</TableHead>
                        <TableHead className="w-[80px] text-center">Signups</TableHead>
                        <TableHead className="w-[260px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => (
                        <TableRow key={code.code}>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">{code.code}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">{code.description}</TableCell>
                          <TableCell className="text-sm text-gray-500 italic">
                            {code.note || <span className="text-gray-300 not-italic">—</span>}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {new Date(code.created).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-medium">{code.signups}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyLink(code.code)}
                                className="text-xs"
                              >
                                Copy Link
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCode(code);
                                  setEditDescription(code.description);
                                  setEditNote(code.note || "");
                                }}
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingCode(code)}
                                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Waitlist Signups</CardTitle>
                <CardDescription>
                  {waitlistLoaded
                    ? `${signups.length} signup${signups.length === 1 ? "" : "s"}, most recent first.`
                    : "All waitlist submissions, most recent first."}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchSignups}
                  disabled={waitlistFetching}
                  className="text-xs"
                >
                  {waitlistFetching ? "Refreshing..." : "Refresh"}
                </Button>
                {csvHref ? (
                  <a
                    href={csvHref}
                    download={csvFilename}
                    className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    Export CSV
                  </a>
                ) : (
                  <Button size="sm" disabled className="text-xs">
                    Export CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {waitlistFetching && !waitlistLoaded ? (
                <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
              ) : waitlistError ? (
                <p className="text-sm text-red-500 py-8 text-center">{waitlistError}</p>
              ) : signups.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No signups yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[130px]">Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Dogs</TableHead>
                        <TableHead className="w-[70px] text-center">SMS</TableHead>
                        <TableHead className="w-[80px]">Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signups.map((s, i) => (
                        <TableRow key={`${s.date}-${s.email}-${i}`}>
                          <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                            {s.date
                              ? new Date(s.date).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">{s.name || "—"}</TableCell>
                          <TableCell className="text-sm text-gray-700 break-all">{s.email || "—"}</TableCell>
                          <TableCell className="text-sm text-gray-700 whitespace-nowrap">{s.phone || "—"}</TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {formatLocation(s)}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {formatDogs(s.dogs)}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {s.smsConsent ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {s.invite_code ? (
                              <Badge variant="secondary" className="font-mono text-xs">
                                {s.invite_code}
                              </Badge>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Success Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Code Created</DialogTitle>
            <DialogDescription>Share this link to track signups from {newCode?.description}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono text-lg px-4 py-2">{newCode?.code}</Badge>
              <span className="text-sm text-gray-500">{newCode?.description}</span>
            </div>
            {newCode?.note ? (
              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <span className="font-medium text-gray-500">Private note: </span>
                {newCode.note}
              </div>
            ) : null}
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Invite Link</p>
              <p className="text-sm font-mono break-all text-foreground">{newCode ? getInviteUrl(newCode.code) : ""}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => newCode && copyLink(newCode.code)}
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCode} onOpenChange={(open) => !open && setEditingCode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Code</DialogTitle>
            <DialogDescription>
              Update <span className="font-mono font-medium">{editingCode?.code}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="edit-description" className="text-sm text-gray-600">
                Description <span className="text-gray-400">(shown on the invite)</span>
              </Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="edit-note" className="text-sm text-gray-600">
                Private note <span className="text-gray-400">(internal only)</span>
              </Label>
              <Input
                id="edit-note"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                placeholder="Leave blank to clear"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingCode(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={editSaving || !editDescription.trim()}>
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deletingCode} onOpenChange={(open) => !open && setDeletingCode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Code</DialogTitle>
            <DialogDescription>
              Delete <span className="font-mono font-medium">{deletingCode?.code}</span> ({deletingCode?.description})? This cannot be undone. Existing signups attributed to this code will keep the code in their record but the code itself will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingCode(null)} disabled={deleteSaving}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteSaving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-gray-900 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function formatLocation(s: Signup): string {
  const parts = s.addressParts || {};
  const city = parts.city || "";
  const state = parts.state || "";
  const zip = parts.zip || s.zip || "";
  const cityState = [city, state].filter(Boolean).join(", ");
  const combined = [cityState, zip].filter(Boolean).join(" ");
  return combined || s.address || "—";
}

function formatDogs(dogs?: Dog[]): string {
  if (!dogs || dogs.length === 0) return "—";
  return dogs
    .map((d) => {
      const name = d.name || "Unnamed";
      const meta = [d.breed, d.age ? `${d.age}y` : null, d.weight ? `${d.weight}lb` : null]
        .filter(Boolean)
        .join(", ");
      return meta ? `${name} (${meta})` : name;
    })
    .join("; ");
}

/* -------------------- CSV helpers -------------------- */

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Guard against CSV injection when opened in spreadsheet apps — prefix a
  // leading single quote to any cell that starts with =, +, -, or @.
  const needsInjectionGuard = /^[=+\-@]/.test(str);
  const safe = needsInjectionGuard ? `'${str}` : str;
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function signupsToCsv(signups: Signup[]): string {
  const headers = [
    "date",
    "name",
    "email",
    "phone",
    "street",
    "apt",
    "city",
    "state",
    "zip",
    "address_full",
    "smsConsent",
    "contactPreference",
    "invite_code",
    "dogs",
  ];

  const rows = signups.map((s) => {
    const parts = s.addressParts || {};
    const dogs = (s.dogs || [])
      .map((d) => {
        const fields = [d.name || "", d.breed || "", d.weight || "", d.age || ""];
        return fields.join("/");
      })
      .join(" | ");

    return [
      s.date || "",
      s.name || "",
      s.email || "",
      s.phone || "",
      parts.street || "",
      parts.apt || "",
      parts.city || "",
      parts.state || "",
      parts.zip || s.zip || "",
      s.address || "",
      s.smsConsent ? "yes" : "no",
      s.contactPreference || "",
      s.invite_code || "",
      dogs,
    ];
  });

  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
  return lines.join("\r\n") + "\r\n";
}
