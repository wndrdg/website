"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/crm/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/crm/ui/dialog";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/crm/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/crm/ui/tabs";
import { ScrollArea } from "@/components/crm/ui/scroll-area";
import { Button } from "@/components/crm/ui/button";
import { Badge } from "@/components/crm/ui/badge";
import { Separator } from "@/components/crm/ui/separator";
import { Textarea } from "@/components/crm/ui/textarea";
import {
  Calendar,
  Upload,
  ExternalLink,
  Send,
  MessageCircle,
  MessageCircleOff,
  StickyNote,
  Plus,
  FileText,
  ChevronDown,
  Database,
  MessageSquare,
  FileSpreadsheet,
  Braces,
  Smartphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/crm/utils/formatters";
import { AgentToggle } from "./AgentToggle";
import { ContactHistory } from "./ContactHistory";

interface Dog {
  id: string;
  name: string;
  breed: string | null;
  age_years: number | null;
  weight_lbs: number | null;
  sex: string | null;
  has_vet_records: boolean;
  vet_clinic_name: string | null;
  vet_clinic_email?: string | null;
  vet_clinic_phone?: string | null;
  vet_clinic_fax?: string | null;
  vet_records_requested_at: string | null;
  vet_records_received_at: string | null;
  known_conditions: string[];
  medications: string[];
  supplements: string[];
  created_at: string;
}

interface BloodDraw {
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
}

interface VetRecordsRequest {
  id: string;
  dog_id: string;
  vet_clinic_name: string | null;
  status: string;
  requested_at: string | null;
  received_at: string | null;
  last_follow_up_at: string | null;
  follow_up_count: number;
  created_at: string;
}

interface Note {
  id: string;
  body: string;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  kind?: "user" | "system";
  event_type?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface SmsMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  sent_by: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  lifecycle_stage: string;
  tags: string[];
  created_at: string;
  last_contact_at: string | null;
  agent_enabled: boolean;
  human_requested: boolean;
  testflight_invited_at: string | null;
  testflight_installed_at?: string | null;
  app_onboarded_at: string | null;
  crm_dogs: Dog[];
  crm_notes?: Note[];
  crm_sms_messages?: SmsMessage[];
  crm_blood_draws?: BloodDraw[];
  crm_vet_records_requests?: VetRecordsRequest[];
}

interface Props {
  customer: Customer | null;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ContactInspector({ customer, onClose, onUpdate }: Props) {
  const [appOpen, setAppOpen] = useState(false);
  return (
    <Sheet
      open={!!customer}
      onOpenChange={(open) => {
        if (!open) {
          setAppOpen(false);
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          "p-0 transition-[width,max-width] duration-300",
          appOpen
            ? "w-[78vw] !max-w-[78vw] sm:max-w-[78vw]"
            : "w-[56vw] !max-w-[56vw] sm:max-w-[56vw]",
        )}
      >
        <SheetTitle className="sr-only">
          {customer?.full_name ?? "Customer details"}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Customer inspector with conversation timeline and details
        </SheetDescription>
        {customer && (
          <InspectorContent
            customer={customer}
            onUpdate={onUpdate}
            appOpen={appOpen}
            setAppOpen={setAppOpen}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function InspectorContent({
  customer,
  onUpdate,
  appOpen,
  setAppOpen,
}: {
  customer: Customer;
  onUpdate?: () => void;
  appOpen: boolean;
  setAppOpen: (open: boolean) => void;
}) {
  const [convoOpen, setConvoOpen] = useState(customer.last_contact_at != null);
  const [toggling, setToggling] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerMode, setComposerMode] = useState<"sms" | "note">("sms");
  const [sending, setSending] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [localNotes, setLocalNotes] = useState<Note[]>(customer.crm_notes ?? []);
  const [requestingRecords, setRequestingRecords] = useState(false);
  const [inlineNotes, setInlineNotes] = useState<
    { id: string; body: string; created_at: string; author: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dog = customer.crm_dogs?.[0];
  const messages = customer.crm_sms_messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, inlineNotes.length]);

  async function handleComposerSubmit() {
    if (!composerText.trim()) return;
    setSending(true);
    try {
      if (composerMode === "note") {
        const res = await fetch("/api/crm/customers/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact_id: customer.id,
            body: composerText,
          }),
        });
        if (res.ok) {
          const note = await res.json();
          setInlineNotes((prev) => [
            ...prev,
            {
              id: note.id,
              body: composerText,
              created_at: new Date().toISOString(),
              author: "You",
            },
          ]);
          setLocalNotes((prev) => [note, ...prev]);
          setComposerText("");
          onUpdate?.();
        }
      } else {
        setComposerText("");
      }
    } finally {
      setSending(false);
    }
  }

  async function requestVetRecords() {
    if (!dog) return;
    setRequestingRecords(true);
    try {
      const res = await fetch("/api/crm/customers/vet-records-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: customer.id,
          dog_id: dog.id,
          clinic_name: dog.vet_clinic_name,
          clinic_email: dog.vet_clinic_email ?? null,
          clinic_phone: dog.vet_clinic_phone ?? null,
          clinic_fax: dog.vet_clinic_fax ?? null,
        }),
      });
      if (res.ok) onUpdate?.();
    } finally {
      setRequestingRecords(false);
    }
  }

  async function toggleConversation() {
    const newState = !convoOpen;
    setToggling(true);
    try {
      const res = await fetch("/api/crm/customers/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: customer.id, open: newState }),
      });
      if (res.ok) {
        setConvoOpen(newState);
        onUpdate?.();
      }
    } finally {
      setToggling(false);
    }
  }

  async function saveNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/crm/customers/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: customer.id, body: noteText }),
      });
      if (res.ok) {
        const note = await res.json();
        setLocalNotes((prev) => [note, ...prev]);
        setNoteText("");
        setShowNoteInput(false);
        onUpdate?.();
      }
    } finally {
      setSavingNote(false);
    }
  }

  const timeline = [
    ...messages.map((msg) => ({ kind: "sms" as const, ...msg })),
    ...inlineNotes.map((n) => ({
      kind: "note" as const,
      id: n.id,
      body: n.body,
      created_at: n.created_at,
      author: n.author,
    })),
    ...localNotes
      .filter((n) => n.kind === "system")
      .map((n) => ({
        kind: "event" as const,
        id: n.id,
        body: n.body,
        created_at: n.created_at,
        event_type: n.event_type ?? null,
      })),
  ].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const timelineEmpty = timeline.length === 0;

  return (
    <div className="flex h-full">
      {/* Left column: conversation */}
      <div className="flex flex-1 min-w-0 flex-col border-r">
        <div className="border-b px-8 pt-8 pb-5">
          <h2
            className="truncate text-[22px] font-semibold"
            title={customer.full_name ?? ""}
          >
            {customer.full_name}
          </h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {[customer.city, customer.state].filter(Boolean).join(", ")}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <AgentToggle
              customerId={customer.id}
              agentEnabled={customer.agent_enabled}
              humanRequested={customer.human_requested}
              variant="button"
              onUpdate={onUpdate}
            />
            <Button
              variant={convoOpen ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              disabled={toggling}
              onClick={toggleConversation}
            >
              {convoOpen ? (
                <>
                  <MessageCircle className="h-3.5 w-3.5" />
                  Open
                </>
              ) : (
                <>
                  <MessageCircleOff className="h-3.5 w-3.5" />
                  Closed
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAppOpen(true)}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Open in App
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-3">
            {timelineEmpty ? (
              <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">
                No messages yet
              </div>
            ) : (
              <div className="flex flex-col">
                {timeline.map((item, i) => {
                  const marginTop = i === 0 ? 0 : 12;

                  if (item.kind === "event") {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 py-2 text-xs text-muted-foreground"
                        style={{ marginTop: i === 0 ? 0 : 12 }}
                      >
                        <Separator className="flex-1" />
                        <FileText className="h-3 w-3" />
                        <span>{item.body}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(item.created_at)}</span>
                        <Separator className="flex-1" />
                      </div>
                    );
                  }
                  if (item.kind === "note") {
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] leading-normal text-amber-900"
                        style={{ marginTop }}
                      >
                        <p>{item.body}</p>
                        <p className="mt-1 text-[11px] text-amber-700">
                          {item.author} — internal note —{" "}
                          {formatRelativeTime(item.created_at)}
                        </p>
                      </div>
                    );
                  }

                  const isOutbound = item.direction === "outbound";
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex",
                        isOutbound ? "justify-end" : "justify-start",
                      )}
                      style={{ marginTop }}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] px-3.5 py-2 text-[13px] leading-snug",
                          isOutbound
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground",
                        )}
                        style={{ borderRadius: 12 }}
                      >
                        <p>{item.body}</p>
                        <p className="mt-1 text-[10px] opacity-60">
                          {item.sent_by ? `${item.sent_by} · ` : ""}
                          {formatRelativeTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {convoOpen && (
          <div
            className={cn(
              "border-t px-8 pt-3 pb-6 transition-colors",
              composerMode === "note" ? "bg-amber-50" : "bg-background",
            )}
          >
            <Tabs
              value={composerMode}
              onValueChange={(v) => setComposerMode(v as "sms" | "note")}
              className="mb-3"
            >
              <TabsList>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="note">Internal Note</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Textarea
                placeholder={
                  composerMode === "sms"
                    ? "Type a message..."
                    : "Add an internal note..."
                }
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComposerSubmit();
                  }
                }}
                rows={1}
                className={cn(
                  "max-h-24 min-h-10 resize-none text-sm",
                  composerMode === "note" && "bg-amber-50",
                )}
              />
              <Button
                size="icon"
                className={cn(
                  "h-10 w-10 shrink-0",
                  composerMode === "note" &&
                    "bg-amber-600 text-white hover:bg-amber-700",
                )}
                disabled={!composerText.trim() || sending}
                onClick={handleComposerSubmit}
              >
                {composerMode === "sms" ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <StickyNote className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right column: details */}
      <ScrollArea className="flex-1 min-w-0">
        <div className="border-b px-9 pt-8 pb-6">
          {customer.tags?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {customer.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="h-2" />
          )}
        </div>

        <div className="px-9 pt-7 pb-10">
          <ContactHistory customer={customer} />

          <Separator className="mb-7" />

          <section className="mb-7">
            <h4 className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Details
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailField label="Email" value={customer.email} />
              <DetailField label="Phone" value={customer.phone} />
              <DetailField
                label="Signed up"
                value={formatRelativeTime(customer.created_at)}
              />
              <DetailField
                label="Last contact"
                value={
                  customer.last_contact_at
                    ? formatRelativeTime(customer.last_contact_at)
                    : "Never"
                }
              />
            </div>
          </section>

          <Separator className="mb-7" />

          <section className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Dog
              </h4>
              {dog && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  onClick={() => setAppOpen(true)}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Open in App
                </Button>
              )}
            </div>
            {dog ? (
              <>
                <p className="mb-3 text-base font-semibold">{dog.name}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {dog.breed && <DetailField label="Breed" value={dog.breed} />}
                  {dog.age_years && (
                    <DetailField label="Age" value={`${dog.age_years} yrs`} />
                  )}
                  {dog.weight_lbs && (
                    <DetailField
                      label="Weight"
                      value={`${dog.weight_lbs} lbs`}
                    />
                  )}
                  {dog.sex && (
                    <DetailField label="Sex" value={dog.sex.replace("_", " ")} />
                  )}
                </div>
                <div className="mt-4">
                  <DataCorpus dog={dog} />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No dog added yet</p>
            )}
          </section>

          <Separator className="mb-7" />

          <section className="mb-7">
            <h4 className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Actions
            </h4>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="h-10 justify-start gap-2">
                <Calendar className="h-4 w-4" /> Book Blood Draw
              </Button>
              <Button
                variant="outline"
                className="h-10 justify-start gap-2"
                disabled={!dog || requestingRecords}
                onClick={requestVetRecords}
              >
                <FileText className="h-4 w-4" />
                {requestingRecords ? "Sending..." : "Request Vet Records"}
              </Button>
              <Button variant="outline" className="h-10 justify-start gap-2">
                <Upload className="h-4 w-4" /> Upload Vet Records
              </Button>
              <Button variant="outline" className="h-10 justify-start gap-2">
                <ExternalLink className="h-4 w-4" /> View in App
              </Button>
            </div>
          </section>

          <Separator className="mb-7" />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Notes ({localNotes.length})
              </h4>
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Add note"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {showNoteInput && (
              <div className="mb-3">
                <Textarea
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="mb-2 text-sm"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNoteInput(false);
                      setNoteText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!noteText.trim() || savingNote}
                    onClick={saveNote}
                  >
                    <StickyNote className="mr-1.5 h-3.5 w-3.5" />
                    {savingNote ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {localNotes.length === 0 && !showNoteInput && (
                <p className="text-[13px] text-muted-foreground">No notes yet</p>
              )}
              {localNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "rounded-lg px-3.5 py-3 text-[13px] leading-normal",
                    note.is_pinned ? "bg-amber-50" : "bg-muted",
                  )}
                >
                  <p>{note.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatRelativeTime(note.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* Third column: app preview */}
      {appOpen && (
        <div className="flex w-[300px] shrink-0 flex-col border-l bg-muted/40">
          <div className="flex items-center justify-between border-b bg-background px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              App
            </div>
            <button
              onClick={() => setAppOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close app preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="flex aspect-[9/19.5] w-full max-w-[240px] items-center justify-center rounded-[32px] border-4 border-foreground/10 bg-background text-center text-xs text-muted-foreground">
              iOS app preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="min-w-0">
      <span className="text-muted-foreground">{label}</span>
      <p className="break-words font-medium">{value ?? "---"}</p>
    </div>
  );
}

type CorpusItemType = "transcript" | "chat" | "blood_draw_pdf" | "blood_draw_csv" | "vet_records";
type CorpusFormat = "json" | "markdown" | "pdf" | "csv";

interface CorpusItem {
  id: string;
  name: string;
  type: CorpusItemType;
  format: CorpusFormat;
  date: string;
}

function getCorpusItems(dog: Dog): CorpusItem[] {
  const items: CorpusItem[] = [
    {
      id: "onboarding",
      name: "Onboarding transcript",
      type: "transcript",
      format: "json",
      date: dog.created_at,
    },
    {
      id: "chat-1",
      name: "AI chat — vet records Q&A",
      type: "chat",
      format: "json",
      date: dog.created_at,
    },
    {
      id: "chat-2",
      name: "AI chat — blood draw scheduling",
      type: "chat",
      format: "json",
      date: dog.created_at,
    },
  ];
  if (dog.vet_records_received_at) {
    items.push({
      id: "vet-records",
      name: `${dog.vet_clinic_name ?? "Vet"} records`,
      type: "vet_records",
      format: "pdf",
      date: dog.vet_records_received_at,
    });
  }
  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

const TYPE_ICON: Record<CorpusItemType, typeof FileText> = {
  transcript: Braces,
  chat: MessageSquare,
  blood_draw_pdf: FileText,
  blood_draw_csv: FileSpreadsheet,
  vet_records: FileText,
};

function DataCorpus({ dog }: { dog: Dog }) {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<CorpusItem | null>(null);
  const items = getCorpusItems(dog);

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Data Corpus</span>
              <span className="text-xs text-muted-foreground">
                {items.length} file{items.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t">
            {items.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No files yet
              </p>
            ) : (
              <ul>
                {items.map((item) => {
                  const Icon = TYPE_ICON[item.type];
                  return (
                    <li key={item.id} className="border-b last:border-b-0">
                      <button
                        onClick={() => setActiveItem(item)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/40"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm">
                          {item.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wide"
                        >
                          {item.format}
                        </Badge>
                        <span className="w-24 text-right text-xs text-muted-foreground">
                          {formatRelativeTime(item.date)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog
        open={!!activeItem}
        onOpenChange={(o) => !o && setActiveItem(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeItem?.name}</DialogTitle>
            <DialogDescription>
              {activeItem?.format.toUpperCase()} ·{" "}
              {activeItem && formatRelativeTime(activeItem.date)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Preview not wired up yet
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
