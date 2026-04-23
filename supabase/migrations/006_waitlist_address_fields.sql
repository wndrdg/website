-- Full address fields on the waitlist. The website form collects the
-- complete parsed address (street, apt, city, state, zip); only city and
-- zip lived in crm_waitlist until now. Street address enables precise map
-- pin placement when present, and is useful for CRM outreach.
ALTER TABLE crm_waitlist
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS apt TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT;
