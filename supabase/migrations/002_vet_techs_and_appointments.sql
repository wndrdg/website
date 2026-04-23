-- Vet techs table
CREATE TABLE crm_vet_techs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_vet_techs_updated_at BEFORE UPDATE ON crm_vet_techs FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();

-- Appointments table
CREATE TABLE crm_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES crm_dogs(id),
  vet_tech_id UUID REFERENCES crm_vet_techs(id) NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  address TEXT,
  city TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_date ON crm_appointments(appointment_date);
CREATE INDEX idx_appointments_tech ON crm_appointments(vet_tech_id, appointment_date);
CREATE INDEX idx_appointments_customer ON crm_appointments(customer_id);

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON crm_appointments FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();
