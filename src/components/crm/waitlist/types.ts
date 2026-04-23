// Contact-centric waitlist model. A "waitlist entry" is now a Contact
// with is_waitlist=true, not a separate row on its own table.

export type WaitlistContact = {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  street: string | null;
  apt: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  dog_name: string | null;
  dog_breed: string | null;
  sms_consent: boolean;
  waitlist_source: string | null;
  referral_code: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  lifecycle_stage: string;
  is_waitlist: boolean;
  is_beta: boolean;
  is_customer: boolean;
  last_contact_at: string | null;
  created_at: string;

  // Derived (server-computed booleans joined from crm_appointments)
  has_vcpr: boolean;
  has_blood_draw: boolean;
  appointments: WaitlistAppointment[];
};

export type WaitlistAppointment = {
  id: string;
  type: "vcpr" | "blood_draw";
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  vet_name: string | null;
  vet_tech_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

export type CodeMeta = {
  description?: string;
  note?: string;
  created?: string;
};
