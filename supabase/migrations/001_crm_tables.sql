-- Wonder Dog CRM — Initial Schema
-- All CRM tables prefixed with crm_ to avoid conflicts with app tables

-- ─── CRM Users ───────────────────────────────────────────────

CREATE TABLE crm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'vet')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Customers ───────────────────────────────────────────────

CREATE TABLE crm_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id UUID,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  city TEXT,
  state TEXT,
  zip TEXT,
  lifecycle_stage TEXT DEFAULT 'waitlist',
  waitlist_position INTEGER,
  waitlist_source TEXT,
  testflight_invited_at TIMESTAMPTZ,
  testflight_installed_at TIMESTAMPTZ,
  app_onboarded_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  assigned_agent_id UUID REFERENCES crm_users(id),
  notes_count INTEGER DEFAULT 0,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_search ON crm_customers
  USING GIN (to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '')));
CREATE INDEX idx_customers_stage ON crm_customers(lifecycle_stage);
CREATE INDEX idx_customers_created ON crm_customers(created_at DESC);

-- ─── Dogs ────────────────────────────────────────────────────

CREATE TABLE crm_dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  app_dog_id UUID,
  name TEXT NOT NULL,
  breed TEXT,
  age_years NUMERIC(4,1),
  weight_lbs NUMERIC(5,1),
  sex TEXT CHECK (sex IN ('male', 'female', 'male_neutered', 'female_spayed')),
  photo_url TEXT,
  vitality_status TEXT,
  has_vet_records BOOLEAN DEFAULT false,
  vet_records_requested_at TIMESTAMPTZ,
  vet_records_received_at TIMESTAMPTZ,
  vet_clinic_name TEXT,
  vet_clinic_phone TEXT,
  vet_clinic_email TEXT,
  vet_clinic_fax TEXT,
  known_conditions TEXT[],
  medications TEXT[],
  supplements TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Customer Events ─────────────────────────────────────────

CREATE TABLE crm_customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES crm_dogs(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES crm_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_customer ON crm_customer_events(customer_id, created_at DESC);
CREATE INDEX idx_events_type ON crm_customer_events(event_type);

-- ─── SMS Messages ────────────────────────────────────────────

CREATE TABLE crm_sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  twilio_sid TEXT UNIQUE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT,
  to_number TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  is_automated BOOLEAN DEFAULT false,
  sent_by UUID REFERENCES crm_users(id),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sms_customer ON crm_sms_messages(customer_id, created_at DESC);
CREATE INDEX idx_sms_unread ON crm_sms_messages(customer_id) WHERE direction = 'inbound' AND read_at IS NULL;

-- ─── Notes ───────────────────────────────────────────────────

CREATE TABLE crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES crm_dogs(id),
  body TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES crm_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Blood Draws ─────────────────────────────────────────────

CREATE TABLE crm_blood_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES crm_dogs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed',
    'results_processing', 'vet_review', 'approved', 'delivered', 'cancelled'
  )),
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  scheduled_address TEXT,
  scheduled_city TEXT,
  scheduled_zip TEXT,
  phlebotomist_name TEXT,
  phlebotomist_id UUID,
  draw_completed_at TIMESTAMPTZ,
  lab_partner TEXT DEFAULT 'antech',
  lab_accession_number TEXT,
  lab_results_received_at TIMESTAMPTZ,
  lab_results_data JSONB,
  vet_reviewer_id UUID REFERENCES crm_users(id),
  vet_review_started_at TIMESTAMPTZ,
  vet_review_completed_at TIMESTAMPTZ,
  vet_review_notes TEXT,
  vet_approved BOOLEAN,
  results_delivered_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blood_draws_status ON crm_blood_draws(status);
CREATE INDEX idx_blood_draws_date ON crm_blood_draws(scheduled_date);
CREATE INDEX idx_blood_draws_customer ON crm_blood_draws(customer_id);

-- ─── Vet Records Requests ────────────────────────────────────

CREATE TABLE crm_vet_records_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES crm_dogs(id) ON DELETE CASCADE,
  vet_clinic_name TEXT,
  vet_clinic_phone TEXT,
  vet_clinic_email TEXT,
  vet_clinic_fax TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'requested', 'follow_up', 'received', 'cancelled'
  )),
  requested_at TIMESTAMPTZ,
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  records_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Waitlist ────────────────────────────────────────────────

CREATE TABLE crm_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  zip TEXT,
  city TEXT,
  dog_name TEXT,
  dog_breed TEXT,
  source TEXT,
  referral_code TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  position INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'converted', 'declined', 'expired')),
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_waitlist_status ON crm_waitlist(status);
CREATE INDEX idx_waitlist_position ON crm_waitlist(position);

-- ─── SMS Templates ───────────────────────────────────────────

CREATE TABLE crm_sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default templates
INSERT INTO crm_sms_templates (slug, name, body, trigger_event) VALUES
('testflight_invite', 'TestFlight Invite', E'Hey {{first_name}}! \U0001F415 Your spot at Wonder Dog is ready. Download the app here: {{testflight_link}} \u2014 Welcome to the pack!', 'invited'),
('blood_draw_scheduled', 'Blood Draw Scheduled', E'Hi {{first_name}}! {{dog_name}}''s blood draw is confirmed for {{draw_date}} between {{draw_time_start}}-{{draw_time_end}}. We''ll come to you at {{draw_address}}. Reply with any questions!', 'blood_draw_scheduled'),
('blood_draw_reminder', 'Blood Draw Reminder (24hr)', E'Reminder: {{dog_name}}''s blood draw is tomorrow, {{draw_date}}! Our team will arrive between {{draw_time_start}}-{{draw_time_end}} at {{draw_address}}. Please have {{dog_name}} fast for 8 hours before. \U0001F43E', NULL),
('blood_draw_completed', 'Blood Draw Complete', E'All done! {{dog_name}} did great today. \U0001F389 Results typically take 3-5 business days. We''ll text you the moment they''re ready.', 'blood_draw_completed'),
('results_ready', 'Results Ready', E'{{dog_name}}''s health dashboard is live! \U0001F415 Open the Wonder Dog app to explore {{dog_name}}''s full biomarker results and personalized insights. Questions? Just text us back.', 'results_delivered'),
('welcome', 'Welcome to Wonder Dog', E'Welcome to Wonder Dog, {{first_name}}! \U0001F415 This is your direct line to our team. Text us anytime with questions about {{dog_name}}''s health journey. We''re here for you.', 'account_created');

-- ─── Updated_at trigger ──────────────────────────────────────

CREATE OR REPLACE FUNCTION crm_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON crm_customers FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
CREATE TRIGGER trg_dogs_updated_at BEFORE UPDATE ON crm_dogs FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
CREATE TRIGGER trg_sms_messages_updated_at BEFORE UPDATE ON crm_sms_messages FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON crm_notes FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
CREATE TRIGGER trg_blood_draws_updated_at BEFORE UPDATE ON crm_blood_draws FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
CREATE TRIGGER trg_vet_records_updated_at BEFORE UPDATE ON crm_vet_records_requests FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
CREATE TRIGGER trg_sms_templates_updated_at BEFORE UPDATE ON crm_sms_templates FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
