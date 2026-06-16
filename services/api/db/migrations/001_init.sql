-- Initial schema for ProductDesignOS

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  links JSONB DEFAULT '{}'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'private',
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_images (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES items(id) ON DELETE CASCADE,
  url TEXT,
  width INT,
  height INT,
  aspect TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS item_tags (
  item_id TEXT REFERENCES items(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS interactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  item_id TEXT REFERENCES items(id) ON DELETE CASCADE,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  followed_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id)
);

CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audits (
  id SERIAL PRIMARY KEY,
  item_id TEXT REFERENCES items(id),
  status_history JSONB,
  reviewer TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
