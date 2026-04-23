// CRM TypeScript types — mirrors the database schema

// ─── Lifecycle ───────────────────────────────────────────────

export const LIFECYCLE_STAGES = [
  "onboarded",
  "lab_scheduled",
  "labs_pending",
  "labs_need_approval",
  "lab_complete",
  // Legacy
  "waitlist",
  "activated",
  "onboarding",
  "dog_added",
  "vet_details_added",
  "medical_records_uploaded",
  "vet_records_requested",
  "vet_records_received",
  "blood_panel_scheduling",
  "blood_panel_scheduled",
  "blood_panel_complete_awaiting_labs",
  "blood_panel_labs_received_pending_review",
  "vet_approved",
  "vet_rejected",
  "invited",
  "downloaded",
  "blood_draw_scheduled",
  "blood_draw_completed",
  "results_processing",
  "vet_review",
  "results_delivered",
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

// ─── CRM Users ───────────────────────────────────────────────

export type CrmUserRole = "admin" | "agent" | "vet";

export interface CrmUser {
  id: string;
  email: string;
  name: string;
  role: CrmUserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Customers ───────────────────────────────────────────────

export interface CrmCustomer {
  id: string;
  app_user_id: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lifecycle_stage: LifecycleStage;
  waitlist_position: number | null;
  waitlist_source: string | null;
  testflight_invited_at: string | null;
  testflight_installed_at: string | null;
  app_onboarded_at: string | null;
  is_active: boolean;
  tags: string[];
  assigned_agent_id: string | null;
  notes_count: number;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  dogs?: CrmDog[];
  assigned_agent?: CrmUser | null;
}

// ─── Dogs ────────────────────────────────────────────────────

export type DogSex = "male" | "female" | "male_neutered" | "female_spayed";

export interface CrmDog {
  id: string;
  customer_id: string;
  app_dog_id: string | null;
  name: string;
  breed: string | null;
  age_years: number | null;
  weight_lbs: number | null;
  sex: DogSex | null;
  photo_url: string | null;
  vitality_status: string | null;
  has_vet_records: boolean;
  vet_records_requested_at: string | null;
  vet_records_received_at: string | null;
  vet_clinic_name: string | null;
  vet_clinic_phone: string | null;
  vet_clinic_email: string | null;
  vet_clinic_fax: string | null;
  known_conditions: string[];
  medications: string[];
  supplements: string[];
  created_at: string;
  updated_at: string;
}

// ─── Customer Events ─────────────────────────────────────────

export const EVENT_TYPES = [
  "waitlist_joined",
  "invited",
  "testflight_sent",
  "app_downloaded",
  "account_created",
  "dog_added",
  "dog_updated",
  "vet_records_requested",
  "vet_records_received",
  "blood_draw_scheduled",
  "blood_draw_completed",
  "results_processing",
  "vet_review_started",
  "vet_review_approved",
  "results_delivered",
  "sms_sent",
  "sms_received",
  "note_added",
  "stage_override",
  "tag_added",
  "tag_removed",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface CrmCustomerEvent {
  id: string;
  customer_id: string;
  dog_id: string | null;
  event_type: EventType;
  event_data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  // Joined
  creator?: CrmUser | null;
}

// ─── SMS Messages ────────────────────────────────────────────

export type SmsDirection = "inbound" | "outbound";
export type SmsStatus = "queued" | "sent" | "delivered" | "failed" | "received";

export interface CrmSmsMessage {
  id: string;
  customer_id: string;
  twilio_sid: string | null;
  direction: SmsDirection;
  from_number: string | null;
  to_number: string | null;
  body: string;
  status: SmsStatus;
  is_automated: boolean;
  sent_by: string | null;
  read_at: string | null;
  created_at: string;
  // Joined
  sender?: CrmUser | null;
  customer?: CrmCustomer | null;
}

// ─── Notes ───────────────────────────────────────────────────

export interface CrmNote {
  id: string;
  customer_id: string;
  dog_id: string | null;
  body: string;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  creator?: CrmUser | null;
}

// ─── Blood Draws ─────────────────────────────────────────────

export const BLOOD_DRAW_STATUSES = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "results_processing",
  "vet_review",
  "approved",
  "delivered",
  "cancelled",
] as const;

export type BloodDrawStatus = (typeof BLOOD_DRAW_STATUSES)[number];

export interface CrmBloodDraw {
  id: string;
  customer_id: string;
  dog_id: string;
  status: BloodDrawStatus;
  scheduled_date: string | null;
  scheduled_time_start: string | null;
  scheduled_time_end: string | null;
  scheduled_address: string | null;
  scheduled_city: string | null;
  scheduled_zip: string | null;
  phlebotomist_name: string | null;
  phlebotomist_id: string | null;
  draw_completed_at: string | null;
  lab_partner: string;
  lab_accession_number: string | null;
  lab_results_received_at: string | null;
  lab_results_data: Record<string, unknown> | null;
  vet_reviewer_id: string | null;
  vet_review_started_at: string | null;
  vet_review_completed_at: string | null;
  vet_review_notes: string | null;
  vet_approved: boolean | null;
  results_delivered_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: CrmCustomer | null;
  dog?: CrmDog | null;
  vet_reviewer?: CrmUser | null;
}

// ─── Vet Records Requests ────────────────────────────────────

export const VET_RECORDS_STATUSES = [
  "pending",
  "requested",
  "follow_up",
  "received",
  "cancelled",
] as const;

export type VetRecordsStatus = (typeof VET_RECORDS_STATUSES)[number];

export interface CrmVetRecordsRequest {
  id: string;
  customer_id: string;
  dog_id: string;
  vet_clinic_name: string | null;
  vet_clinic_phone: string | null;
  vet_clinic_email: string | null;
  vet_clinic_fax: string | null;
  status: VetRecordsStatus;
  requested_at: string | null;
  follow_up_count: number;
  last_follow_up_at: string | null;
  received_at: string | null;
  records_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: CrmCustomer | null;
  dog?: CrmDog | null;
}

// ─── Waitlist ────────────────────────────────────────────────

export const WAITLIST_STATUSES = [
  "waiting",
  "invited",
  "converted",
  "declined",
  "expired",
] as const;

export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export interface CrmWaitlistEntry {
  id: string;
  customer_id: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  zip: string | null;
  city: string | null;
  dog_name: string | null;
  dog_breed: string | null;
  source: string | null;
  referral_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  position: number | null;
  status: WaitlistStatus;
  invited_at: string | null;
  converted_at: string | null;
  created_at: string;
}

// ─── SMS Templates ───────────────────────────────────────────

export interface CrmSmsTemplate {
  id: string;
  slug: string;
  name: string;
  body: string;
  description: string | null;
  trigger_event: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Conversations (derived) ─────────────────────────────────

export interface Conversation {
  customer: CrmCustomer;
  last_message: CrmSmsMessage;
  unread_count: number;
}
