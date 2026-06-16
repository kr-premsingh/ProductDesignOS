import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../infra/prod/.env') });

async function main() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'pdos',
    password: process.env.POSTGRES_PASSWORD || 'pdos_pass',
    database: process.env.POSTGRES_DB || 'productdesignos'
  });

  await client.connect();
  console.log('Connected to Postgres');

  const migration = fs.readFileSync(path.resolve(__dirname, '../db/migrations/001_init.sql'), 'utf-8');
  await client.query(migration);
  console.log('Migration applied');

  // Seed tags
  const tags = ['branding','illustration','ui','packaging','print','motion','3d','interiors'];
  for (const t of tags) {
    await client.query('INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [t, t]);
  }
  console.log('Tags seeded');

  // Seed a sample user and items
  const userId = 'user_1';
  await client.query(
    `INSERT INTO users (id, username, email, display_name, bio, verified)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO NOTHING`,
    [userId, 'nova', 'nova@example.com', 'Nova Designer', 'Designing a signature.', true]
  );

  await client.query(
    `INSERT INTO profiles (user_id, links, interests) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO NOTHING`,
    [userId, JSON.stringify({ website: 'https://example.com' }), JSON.stringify(['branding', 'ui'])]
  );

  const itemId = 'item_1';
  await client.query(
    `INSERT INTO items (id, user_id, title, description, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
    [itemId, userId, 'Signature Logo', 'A neon minimal logo exploration', 'public']
  );
  await client.query(
    `INSERT INTO item_images (id, item_id, url, width, height, aspect) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
    ['img_1', itemId, 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d', 1200, 800, '3:2']
  );

  console.log('Sample user and item seeded');
  await client.end();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
