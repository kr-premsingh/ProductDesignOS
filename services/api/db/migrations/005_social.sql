-- Social module (docs/09 Phase 1): likes/saves on designs. Follows already exist from 001_init.

CREATE TABLE IF NOT EXISTS design_interactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               -- 'like' | 'save'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, design_id, type)
);
