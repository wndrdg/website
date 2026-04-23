-- Add sms_consent tracking to the waitlist. Website signups carry an
-- explicit opt-in checkbox whose state must persist for Twilio A2P
-- compliance (required to prove consent before sending any SMS).
ALTER TABLE crm_waitlist
  ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT false;
