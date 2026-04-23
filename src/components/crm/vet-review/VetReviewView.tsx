"use client";

import { useState } from "react";
import { Card } from "@/components/crm/ui/card";
import { Button } from "@/components/crm/ui/button";
import { Badge } from "@/components/crm/ui/badge";
import { Separator } from "@/components/crm/ui/separator";
import { Sheet, SheetContent } from "@/components/crm/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/crm/ui/table";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Marker {
  name: string;
  value: string;
  unit: string;
  range: string;
  status: "normal" | "high" | "low";
}

interface LabResults {
  summary: string;
  markers: Marker[];
}

interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  crm_dogs: {
    name: string;
    breed: string | null;
    age_years: number | null;
    weight_lbs: number | null;
    sex: string | null;
  }[];
  labResults: LabResults;
}

export function VetReviewView({ customers }: { customers: Customer[] }) {
  const [selected, setSelected] = useState<Customer | null>(null);

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Dog</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Flagged Markers</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const dog = c.crm_dogs?.[0];
              const flagged = c.labResults.markers.filter(
                (m) => m.status !== "normal"
              ).length;

              return (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(c)}
                >
                  <TableCell className="font-medium">{c.full_name}</TableCell>
                  <TableCell>
                    {dog?.name ?? "---"}
                    {dog?.breed && (
                      <span className="text-muted-foreground text-sm ml-2">
                        {dog.breed}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {[c.city, c.state].filter(Boolean).join(", ")}
                  </TableCell>
                  <TableCell>
                    {flagged > 0 ? (
                      <Badge variant="outline" className="!border-amber-400 !text-amber-600">
                        {flagged} flagged
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">All normal</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: "#18181B", color: "#fff" }}
                    >
                      Pending Approval
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  No reviews pending
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          showCloseButton={false}
          style={{
            width: "36vw",
            maxWidth: "none",
            padding: 0,
            boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
          }}
        >
          {selected && (
            <div className="h-full overflow-y-auto">
              <ReviewInspector
                customer={selected}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ReviewInspector({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const dog = customer.crm_dogs?.[0];
  const flaggedMarkers = customer.labResults.markers.filter(
    (m) => m.status !== "normal"
  );
  const normalMarkers = customer.labResults.markers.filter(
    (m) => m.status === "normal"
  );

  return (
    <>
      {/* ── Header ── */}
      <div style={{ padding: "40px 48px 36px 48px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>
              {customer.full_name}
            </h2>
            <p style={{ color: "#6B7280", marginTop: 8, fontSize: 15 }}>
              {[customer.city, customer.state].filter(Boolean).join(", ")}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Button
            size="lg"
            className="flex-1 gap-3"
            style={{ height: 56, fontSize: 16, backgroundColor: "#16A34A", color: "#fff" }}
            onClick={onClose}
          >
            <CheckCircle className="h-5 w-5" />
            Approve
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 gap-3"
            style={{ height: 56, fontSize: 16, borderColor: "#FCA5A5", color: "#DC2626" }}
            onClick={onClose}
          >
            <XCircle className="h-5 w-5" />
            Reject
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "40px 48px 60px 48px" }}>

        {/* Dog Card */}
        {dog && (
          <Card style={{ padding: 32, marginBottom: 40 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, margin: "0 0 20px 0" }}>
              {dog.name}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px" }}>
              {dog.breed && (
                <div>
                  <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Breed
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>{dog.breed}</p>
                </div>
              )}
              {dog.age_years && (
                <div>
                  <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Age
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>{dog.age_years} years</p>
                </div>
              )}
              {dog.weight_lbs && (
                <div>
                  <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Weight
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>{dog.weight_lbs} lbs</p>
                </div>
              )}
              {dog.sex && (
                <div>
                  <p style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Sex
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>
                    {dog.sex.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Lab Summary */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Lab Summary</h3>
          <Card style={{ padding: 32, backgroundColor: "#F9FAFB" }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#374151" }}>
              {customer.labResults.summary}
            </p>
          </Card>
          {flaggedMarkers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Badge variant="outline" className="!border-amber-400 !text-amber-600" style={{ fontSize: 13, padding: "4px 12px" }}>
                {flaggedMarkers.length} marker{flaggedMarkers.length !== 1 ? "s" : ""} outside reference range
              </Badge>
            </div>
          )}
        </div>

        <Separator style={{ marginBottom: 40 }} />

        {/* Flagged Markers */}
        {flaggedMarkers.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Flagged Markers</h3>
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead style={{ padding: "14px 24px", fontSize: 13 }}>Marker</TableHead>
                    <TableHead style={{ padding: "14px 24px", fontSize: 13, textAlign: "right" }}>Value</TableHead>
                    <TableHead style={{ padding: "14px 24px", fontSize: 13, textAlign: "right" }}>Reference</TableHead>
                    <TableHead style={{ padding: "14px 24px", fontSize: 13, textAlign: "center", width: 90 }}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedMarkers.map((marker) => (
                    <TableRow key={marker.name} style={{ backgroundColor: "rgba(255,251,235,0.4)" }}>
                      <TableCell style={{ padding: "16px 24px", fontWeight: 500, fontSize: 14 }}>{marker.name}</TableCell>
                      <TableCell style={{ padding: "16px 24px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, fontSize: 14, color: marker.status === "high" ? "#DC2626" : "#D97706" }}>
                        {marker.value}
                        <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}>{marker.unit}</span>
                      </TableCell>
                      <TableCell style={{ padding: "16px 24px", textAlign: "right", fontFamily: "monospace", color: "#9CA3AF", fontSize: 14 }}>
                        {marker.range} {marker.unit}
                      </TableCell>
                      <TableCell style={{ padding: "16px 24px", textAlign: "center" }}>
                        <Badge
                          variant="outline"
                          className={marker.status === "high" ? "!border-red-300 !text-red-600" : "!border-amber-300 !text-amber-600"}
                        >
                          {marker.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* All Markers */}
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>All Markers</h3>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead style={{ padding: "14px 24px", fontSize: 13 }}>Marker</TableHead>
                  <TableHead style={{ padding: "14px 24px", fontSize: 13, textAlign: "right" }}>Value</TableHead>
                  <TableHead style={{ padding: "14px 24px", fontSize: 13, textAlign: "right" }}>Reference</TableHead>
                  <TableHead style={{ padding: "14px 24px", fontSize: 13, textAlign: "center", width: 90 }}>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normalMarkers.map((marker) => (
                  <TableRow key={marker.name}>
                    <TableCell style={{ padding: "16px 24px", fontSize: 14 }}>{marker.name}</TableCell>
                    <TableCell style={{ padding: "16px 24px", textAlign: "right", fontFamily: "monospace", fontSize: 14 }}>
                      {marker.value}
                      <span style={{ color: "#9CA3AF", marginLeft: 4 }}>{marker.unit}</span>
                    </TableCell>
                    <TableCell style={{ padding: "16px 24px", textAlign: "right", fontFamily: "monospace", color: "#9CA3AF", fontSize: 14 }}>
                      {marker.range} {marker.unit}
                    </TableCell>
                    <TableCell style={{ padding: "16px 24px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", height: 10, width: 10, borderRadius: "50%", backgroundColor: "#10B981" }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

      </div>
    </>
  );
}
