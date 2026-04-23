export type WaitlistEntry = {
  id: string;
  customer_id: string | null;
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
  status: string;
  invited_at: string | null;
  converted_at: string | null;
  created_at: string;
  sms_consent: boolean;
};

export type CodeMeta = {
  description?: string;
  note?: string;
  created?: string;
};
