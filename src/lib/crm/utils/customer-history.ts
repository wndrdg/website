// Aggregate-on-read customer history.
// Composes a chronological event list from existing CRM tables —
// no writes to crm_customer_events. Source of truth lives on each row's timestamps.

export type HistoryCategory =
  | "signup"
  | "invite"
  | "app"
  | "dog"
  | "vet_records"
  | "blood_draw"
  | "lab"
  | "vet_review"
  | "delivery"
  | "sms"
  | "note";

export interface HistoryEvent {
  id: string;
  category: HistoryCategory;
  label: string;
  detail?: string;
  timestamp: string;
}

interface DogLike {
  id: string;
  name: string;
  vet_records_requested_at: string | null;
  vet_records_received_at: string | null;
  created_at: string;
}

interface SmsLike {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  sent_by: string | null;
  created_at: string;
}

interface NoteLike {
  id: string;
  body: string;
  created_at: string;
}

interface BloodDrawLike {
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

interface VetRecordsLike {
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

export interface HistoryCustomer {
  id: string;
  created_at: string;
  testflight_invited_at: string | null;
  testflight_installed_at?: string | null;
  app_onboarded_at: string | null;
  crm_dogs?: DogLike[];
  crm_sms_messages?: SmsLike[];
  crm_notes?: NoteLike[];
  crm_blood_draws?: BloodDrawLike[];
  crm_vet_records_requests?: VetRecordsLike[];
}

function dogName(dogs: DogLike[] | undefined, dogId: string | null): string {
  if (!dogId) return "";
  return dogs?.find((d) => d.id === dogId)?.name ?? "";
}

function snippet(text: string, max = 60): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function buildCustomerHistory(c: HistoryCustomer): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  const dogs = c.crm_dogs ?? [];

  events.push({
    id: `signup-${c.id}`,
    category: "signup",
    label: "Signed up",
    timestamp: c.created_at,
  });

  if (c.testflight_invited_at) {
    events.push({
      id: `tf-invited-${c.id}`,
      category: "invite",
      label: "TestFlight invite sent",
      timestamp: c.testflight_invited_at,
    });
  }

  if (c.testflight_installed_at) {
    events.push({
      id: `tf-installed-${c.id}`,
      category: "app",
      label: "Downloaded the app",
      timestamp: c.testflight_installed_at,
    });
  }

  if (c.app_onboarded_at) {
    events.push({
      id: `app-onboarded-${c.id}`,
      category: "app",
      label: "Completed app onboarding",
      timestamp: c.app_onboarded_at,
    });
  }

  for (const dog of dogs) {
    if (dog.created_at) {
      events.push({
        id: `dog-added-${dog.id}`,
        category: "dog",
        label: `Added dog: ${dog.name}`,
        timestamp: dog.created_at,
      });
    }
  }

  for (const req of c.crm_vet_records_requests ?? []) {
    const name = dogName(dogs, req.dog_id);
    const clinic = req.vet_clinic_name ? ` from ${req.vet_clinic_name}` : "";
    if (req.requested_at) {
      events.push({
        id: `vrr-req-${req.id}`,
        category: "vet_records",
        label: `Vet records requested${name ? ` for ${name}` : ""}${clinic}`,
        timestamp: req.requested_at,
      });
    }
    if (req.received_at) {
      events.push({
        id: `vrr-recv-${req.id}`,
        category: "vet_records",
        label: `Vet records received${name ? ` for ${name}` : ""}`,
        timestamp: req.received_at,
      });
    }
  }

  // Fall back to dog-level vet records timestamps if no request row was created
  const requestedDogIds = new Set((c.crm_vet_records_requests ?? []).map((r) => r.dog_id));
  for (const dog of dogs) {
    if (requestedDogIds.has(dog.id)) continue;
    if (dog.vet_records_requested_at) {
      events.push({
        id: `dog-vrr-req-${dog.id}`,
        category: "vet_records",
        label: `Vet records requested for ${dog.name}`,
        timestamp: dog.vet_records_requested_at,
      });
    }
    if (dog.vet_records_received_at) {
      events.push({
        id: `dog-vrr-recv-${dog.id}`,
        category: "vet_records",
        label: `Vet records received for ${dog.name}`,
        timestamp: dog.vet_records_received_at,
      });
    }
  }

  for (const draw of c.crm_blood_draws ?? []) {
    const name = dogName(dogs, draw.dog_id);
    const forDog = name ? ` for ${name}` : "";
    if (draw.created_at) {
      const sched = draw.scheduled_date ? ` (${draw.scheduled_date})` : "";
      events.push({
        id: `bd-sched-${draw.id}`,
        category: "blood_draw",
        label: `Blood draw scheduled${forDog}${sched}`,
        timestamp: draw.created_at,
      });
    }
    if (draw.draw_completed_at) {
      events.push({
        id: `bd-done-${draw.id}`,
        category: "blood_draw",
        label: `Blood draw completed${forDog}`,
        timestamp: draw.draw_completed_at,
      });
    }
    if (draw.lab_results_received_at) {
      events.push({
        id: `bd-results-${draw.id}`,
        category: "lab",
        label: `Lab results received${forDog}`,
        timestamp: draw.lab_results_received_at,
      });
    }
    if (draw.vet_review_started_at) {
      events.push({
        id: `bd-vr-start-${draw.id}`,
        category: "vet_review",
        label: `Vet review started${forDog}`,
        timestamp: draw.vet_review_started_at,
      });
    }
    if (draw.vet_review_completed_at) {
      const verdict = draw.vet_approved === true
        ? "approved"
        : draw.vet_approved === false
        ? "rejected"
        : "completed";
      events.push({
        id: `bd-vr-end-${draw.id}`,
        category: "vet_review",
        label: `Vet review ${verdict}${forDog}`,
        timestamp: draw.vet_review_completed_at,
      });
    }
    if (draw.results_delivered_at) {
      events.push({
        id: `bd-delivered-${draw.id}`,
        category: "delivery",
        label: `Results delivered${forDog}`,
        timestamp: draw.results_delivered_at,
      });
    }
  }

  for (const msg of c.crm_sms_messages ?? []) {
    const sender = msg.direction === "outbound"
      ? msg.sent_by ?? "Agent"
      : "Customer";
    events.push({
      id: `sms-${msg.id}`,
      category: "sms",
      label: `${sender} ${msg.direction === "outbound" ? "sent SMS" : "replied"}`,
      detail: snippet(msg.body),
      timestamp: msg.created_at,
    });
  }

  for (const note of c.crm_notes ?? []) {
    events.push({
      id: `note-${note.id}`,
      category: "note",
      label: "Internal note added",
      detail: snippet(note.body),
      timestamp: note.created_at,
    });
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
