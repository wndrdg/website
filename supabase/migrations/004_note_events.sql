-- System-event notes in the timeline (vet records request, etc.)
ALTER TABLE crm_notes
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'user' CHECK (kind IN ('user', 'system')),
  ADD COLUMN event_type TEXT,
  ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX idx_crm_notes_kind ON crm_notes(kind) WHERE kind = 'system';
