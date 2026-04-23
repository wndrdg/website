-- Per-customer agent state
ALTER TABLE crm_customers
  ADD COLUMN agent_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN human_requested BOOLEAN NOT NULL DEFAULT false;

-- Global agent kill switch (single-row table)
CREATE TABLE crm_agent_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

CREATE TRIGGER trg_agent_config_updated_at BEFORE UPDATE ON crm_agent_config FOR EACH ROW EXECUTE FUNCTION crm_update_updated_at();

INSERT INTO crm_agent_config (id, enabled) VALUES (1, true);
