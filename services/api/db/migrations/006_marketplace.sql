-- Marketplace module (docs/04, docs/09 Phase 2).

ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_categories TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_capabilities TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_portfolio TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_status TEXT DEFAULT 'none';

CREATE TABLE IF NOT EXISTS offerings (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  fulfillment_type TEXT NOT NULL DEFAULT 'digital',
  pricing_type TEXT NOT NULL DEFAULT 'quote_only',
  price_credits INT,
  lead_time_days INT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offering_id TEXT NOT NULL REFERENCES offerings(id) ON DELETE RESTRICT,
  provider_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  brief TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  quoted_credits INT,
  platform_fee_bps INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offerings_category_status_idx ON offerings(category_id, status);
CREATE INDEX IF NOT EXISTS orders_buyer_idx ON orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_provider_idx ON orders(provider_id, created_at DESC);
