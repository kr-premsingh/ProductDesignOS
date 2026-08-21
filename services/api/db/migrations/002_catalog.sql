-- Catalog module schema (docs/06-data-model.md, docs/13 "catalog" module)
-- Colocated with 001_init.sql purely for Postgres init-mount simplicity; owned by services/core-api.

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  accent_color TEXT,
  attribute_schema JSONB DEFAULT '{}'::jsonb,
  ai_prompt_template TEXT,
  allowed_fulfillment_types TEXT[] DEFAULT ARRAY['digital'],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS designs (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL DEFAULT 'upload',
  remix_of_design_id TEXT REFERENCES designs(id) ON DELETE SET NULL,
  title TEXT,
  asset_url TEXT NOT NULL,
  prompt TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_items (
  board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
  design_id TEXT REFERENCES designs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (board_id, design_id)
);

-- Seed the recommended launch verticals (docs/02, accent colors from docs/11)
INSERT INTO categories (id, slug, name, accent_color, allowed_fulfillment_types) VALUES
  ('cat_branding', 'branding', 'Branding & Logos', '#00E5FF', ARRAY['digital']),
  ('cat_apparel', 'apparel', 'Apparel & Prints', '#FF4DA6', ARRAY['digital','physical']),
  ('cat_invitations', 'invitations', 'Invitations & Stationery', '#E8B23A', ARRAY['digital','physical']),
  ('cat_decor', 'decor', 'Home & Decor', '#7FA37A', ARRAY['digital','physical']),
  ('cat_tattoo', 'tattoo', 'Tattoo & Body Art', '#B6F36A', ARRAY['digital'])
ON CONFLICT (id) DO NOTHING;

-- A handful of seed designs so the feed isn't empty on first boot
INSERT INTO designs (id, category_id, source_type, title, asset_url, prompt, visibility, tags) VALUES
  ('design_seed_1', 'cat_branding', 'ai_generated', 'Signal Mark', 'https://picsum.photos/seed/pdos-branding-1/900/1200', 'minimal neon logo mark', 'public', ARRAY['logo','minimal']),
  ('design_seed_2', 'cat_apparel', 'ai_generated', 'Chromatic Tee', 'https://picsum.photos/seed/pdos-apparel-1/900/1200', 'chromatic streetwear print', 'public', ARRAY['apparel','print']),
  ('design_seed_3', 'cat_invitations', 'upload', 'Golden Hour Invite', 'https://picsum.photos/seed/pdos-invites-1/900/1200', 'warm celebratory invitation', 'public', ARRAY['invitation','event'])
ON CONFLICT (id) DO NOTHING;
