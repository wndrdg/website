import type { LifecycleStage, BloodDrawStatus } from "@/lib/crm/types";

// ─── Lifecycle Stage Config ──────────────────────────────────

export const LIFECYCLE_STAGE_CONFIG: Record<
  LifecycleStage,
  { label: string; color: string; variant: "solid" | "outline" | "muted" | "dark" | "dark-alert" }
> = {
  onboarded: { label: "Onboarded", color: "#9CA3AF", variant: "muted" },
  lab_scheduled: { label: "Labs", color: "#3B82F6", variant: "outline" },
  labs_pending: { label: "Labs", color: "#000000", variant: "dark" },
  labs_need_approval: { label: "Pending Approval", color: "#000000", variant: "dark" },
  lab_complete: { label: "Lab Complete", color: "#3B82F6", variant: "solid" },
  // Legacy/other stages — all map to muted
  waitlist: { label: "Waitlist", color: "#9CA3AF", variant: "muted" },
  activated: { label: "Activated", color: "#9CA3AF", variant: "muted" },
  onboarding: { label: "Onboarding", color: "#9CA3AF", variant: "muted" },
  dog_added: { label: "Dog Added", color: "#9CA3AF", variant: "muted" },
  vet_details_added: { label: "Vet Details", color: "#9CA3AF", variant: "muted" },
  medical_records_uploaded: { label: "Records Uploaded", color: "#9CA3AF", variant: "muted" },
  vet_records_requested: { label: "Records Requested", color: "#9CA3AF", variant: "muted" },
  vet_records_received: { label: "Records Received", color: "#9CA3AF", variant: "muted" },
  blood_panel_scheduling: { label: "Scheduling", color: "#9CA3AF", variant: "muted" },
  blood_panel_scheduled: { label: "Panel Scheduled", color: "#9CA3AF", variant: "muted" },
  blood_panel_complete_awaiting_labs: { label: "Awaiting Labs", color: "#9CA3AF", variant: "muted" },
  blood_panel_labs_received_pending_review: { label: "Pending Review", color: "#9CA3AF", variant: "muted" },
  vet_approved: { label: "Vet Approved", color: "#9CA3AF", variant: "muted" },
  vet_rejected: { label: "Vet Rejected", color: "#9CA3AF", variant: "muted" },
  invited: { label: "Invited", color: "#9CA3AF", variant: "muted" },
  downloaded: { label: "Downloaded", color: "#9CA3AF", variant: "muted" },
  blood_draw_scheduled: { label: "Draw Scheduled", color: "#9CA3AF", variant: "muted" },
  blood_draw_completed: { label: "Draw Completed", color: "#9CA3AF", variant: "muted" },
  results_processing: { label: "Processing", color: "#9CA3AF", variant: "muted" },
  vet_review: { label: "Vet Review", color: "#9CA3AF", variant: "muted" },
  results_delivered: { label: "Delivered", color: "#9CA3AF", variant: "muted" },
};

// ─── Blood Draw Status Config ────────────────────────────────

export const BLOOD_DRAW_STATUS_CONFIG: Record<
  BloodDrawStatus,
  { label: string; color: string }
> = {
  scheduled: { label: "Scheduled", color: "#3B82F6" },
  confirmed: { label: "Confirmed", color: "#10B981" },
  in_progress: { label: "In Progress", color: "#F59E0B" },
  completed: { label: "Completed", color: "#06B6D4" },
  results_processing: { label: "Processing", color: "#EC4899" },
  vet_review: { label: "Vet Review", color: "#8B5CF6" },
  approved: { label: "Approved", color: "#10B981" },
  delivered: { label: "Delivered", color: "#10B981" },
  cancelled: { label: "Cancelled", color: "#EF4444" },
};

// ─── Event Type Labels ───────────────────────────────────────

export const EVENT_TYPE_LABELS: Record<string, string> = {
  waitlist_joined: "Joined Waitlist",
  invited: "Invited",
  testflight_sent: "TestFlight Invite Sent",
  app_downloaded: "App Downloaded",
  account_created: "Account Created",
  dog_added: "Dog Added",
  dog_updated: "Dog Updated",
  vet_records_requested: "Vet Records Requested",
  vet_records_received: "Vet Records Received",
  blood_draw_scheduled: "Blood Draw Scheduled",
  blood_draw_completed: "Blood Draw Completed",
  results_processing: "Results Processing",
  vet_review_started: "Vet Review Started",
  vet_review_approved: "Vet Review Approved",
  results_delivered: "Results Delivered",
  sms_sent: "SMS Sent",
  sms_received: "SMS Received",
  note_added: "Note Added",
  stage_override: "Stage Override",
  tag_added: "Tag Added",
  tag_removed: "Tag Removed",
};
