-- ============================================================
-- Contact-centric refactor
-- ============================================================
-- Flips the model so Contact is the primary entity. "Waitlist",
-- "beta", "customer" become states on a Contact, not separate
-- tables. Appointments own Contact links and have a type
-- discriminator ('vcpr' | 'blood_draw').
--
-- Ordering matters: we drop/recreate crm_appointments before
-- renaming customer_id FKs elsewhere to avoid trigger/constraint
-- churn.
-- ============================================================

-- 1. Drop the old appointments table (day zero; seed-only data,
-- already wiped to 0 by the prior cleanup). Blood_draws keep
-- their own scheduling fields for the lab pipeline — they're a
-- workflow tracker, not a calendar event.
DROP TABLE IF EXISTS crm_appointments CASCADE;

-- 2. Rename the central table
ALTER TABLE crm_customers RENAME TO crm_contacts;

-- 3. State flags + attribution + address + SMS consent
ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS is_waitlist     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_beta         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_customer     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_code   TEXT,
  ADD COLUMN IF NOT EXISTS utm_source      TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium      TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign    TEXT,
  ADD COLUMN IF NOT EXISTS street          TEXT,
  ADD COLUMN IF NOT EXISTS apt             TEXT,
  ADD COLUMN IF NOT EXISTS sms_consent     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dog_name        TEXT,
  ADD COLUMN IF NOT EXISTS dog_breed       TEXT,
  ADD COLUMN IF NOT EXISTS state           TEXT;

-- The old lifecycle_stage enum stays — useful in the CRM UI.
-- Seed the state flags from lifecycle_stage so the existing demo
-- customers are classified (waitlist vs customer).
UPDATE crm_contacts
  SET is_waitlist = (lifecycle_stage IN ('waitlist', 'invited'))
  WHERE is_waitlist IS DISTINCT FROM (lifecycle_stage IN ('waitlist', 'invited'));
UPDATE crm_contacts
  SET is_customer = (lifecycle_stage IN (
    'onboarded', 'lab_scheduled', 'labs_pending', 'labs_need_approval', 'lab_complete'
  ))
  WHERE is_customer IS DISTINCT FROM (lifecycle_stage IN (
    'onboarded', 'lab_scheduled', 'labs_pending', 'labs_need_approval', 'lab_complete'
  ));

-- 4. Rename customer_id → contact_id on every satellite table
ALTER TABLE crm_dogs                RENAME COLUMN customer_id TO contact_id;
ALTER TABLE crm_notes               RENAME COLUMN customer_id TO contact_id;
ALTER TABLE crm_sms_messages        RENAME COLUMN customer_id TO contact_id;
ALTER TABLE crm_customer_events     RENAME COLUMN customer_id TO contact_id;
ALTER TABLE crm_blood_draws         RENAME COLUMN customer_id TO contact_id;
ALTER TABLE crm_vet_records_requests RENAME COLUMN customer_id TO contact_id;

-- 5. Vets table (VCPR assignee)
CREATE TABLE IF NOT EXISTS crm_vets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_state TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_vets_updated_at ON crm_vets;
CREATE TRIGGER trg_vets_updated_at BEFORE UPDATE ON crm_vets
  FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();

-- 6. New appointments table (both VCPR and blood-draw calendar events)
CREATE TABLE crm_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES crm_dogs(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('vcpr', 'blood_draw')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  vet_id UUID REFERENCES crm_vets(id),
  vet_tech_id UUID REFERENCES crm_vet_techs(id),
  notes TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (type = 'vcpr'       AND vet_id IS NOT NULL) OR
    (type = 'blood_draw' AND vet_tech_id IS NOT NULL)
  )
);
CREATE INDEX idx_appointments_contact_scheduled ON crm_appointments(contact_id, scheduled_at DESC);
CREATE INDEX idx_appointments_type_scheduled    ON crm_appointments(type, scheduled_at);
CREATE INDEX idx_appointments_vet               ON crm_appointments(vet_id, scheduled_at);
CREATE INDEX idx_appointments_vet_tech          ON crm_appointments(vet_tech_id, scheduled_at);
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON crm_appointments;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON crm_appointments
  FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();

-- 7. Blood-draw workflow optionally links back to its scheduling appointment
ALTER TABLE crm_blood_draws
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES crm_appointments(id) ON DELETE SET NULL;
