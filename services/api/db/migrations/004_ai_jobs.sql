-- AI module (docs/07-ai-strategy.md): remix jobs + credits ledger (docs/08).

CREATE TABLE IF NOT EXISTS ai_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL DEFAULT 'remix',
  source_design_id TEXT REFERENCES designs(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  provider TEXT NOT NULL DEFAULT 'stub',
  credits_cost INT NOT NULL DEFAULT 1,
  result_design_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Append-only credit ledger; balance is always derivable (docs/08)
CREATE TABLE IF NOT EXISTS credit_ledger_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  balance_after INT NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
