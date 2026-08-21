-- Auth/roles module (docs/04-roles-and-marketplace.md): additive roles, not fixed account types.

CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role, scope)
);
