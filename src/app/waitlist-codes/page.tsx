"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface InviteCode {
  code: string;
  description: string;
  created: string;
  signups: number;
}

export default function WaitlistCodes() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newCode, setNewCode] = useState<InviteCode | null>(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    fetchCodes();
  }, []);

  const createCode = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCode(data.code);
        setShowDialog(true);
        setDescription("");
        fetchCodes();
      }
    } catch (err) {
      console.error("Failed to create code:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInviteUrl = (code: string) => `https://wonder.dog?invite=${code}`;

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(getInviteUrl(code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Invite Codes</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage waitlist invite codes for attribution tracking.</p>
        </div>

        {/* Create Code */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Create New Code</CardTitle>
            <CardDescription>Generate an invite link to share with someone. We'll track signups from their link.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="description" className="text-sm text-gray-600">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g. Pat's friend Danny"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createCode()}
                  className="mt-1"
                />
              </div>
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
                    <TableHead className="w-[120px]">Created</TableHead>
                    <TableHead className="w-[80px] text-center">Signups</TableHead>
                    <TableHead className="w-[100px] text-right">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.code}>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{code.code}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{code.description}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {new Date(code.created).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{code.signups}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLink(code.code)}
                          className="text-xs"
                        >
                          Copy Link
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Invite Link</p>
              <p className="text-sm font-mono break-all">{newCode ? getInviteUrl(newCode.code) : ""}</p>
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
    </div>
  );
}
