import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../infra/prod/.env') });

const client = process.env.DATABASE_URL
  ? new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=disable') ? undefined : { rejectUnauthorized: false }
    })
  : new Client({
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
      user: process.env.POSTGRES_USER || 'pdos',
      password: process.env.POSTGRES_PASSWORD || 'pdos_pass',
      database: process.env.POSTGRES_DB || 'productdesignos'
    });

let connected = false;
export async function initDb() {
  try {
    await client.connect();
    connected = true;
    // ensure migrations applied is handled by seed script; here we just confirm connectivity
    console.log('[db] connected');
  } catch (err) {
    console.warn('[db] connect failed, running in-memory fallback');
    connected = false;
  }
}

export function isConnected() {
  return connected;
}

export async function createUser(user: { id: string; username: string; email: string; password_hash: string; display_name?: string; bio?: string; verified?: boolean; role?: string }) {
  if (!connected) throw new Error('db-not-connected');
  const q = `INSERT INTO users (id, username, email, password_hash, display_name, bio, verified, role) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (username) DO NOTHING`;
  await client.query(q, [user.id, user.username, user.email, user.password_hash, user.display_name || null, user.bio || null, user.verified || false, user.role || 'student']);
  try {
    await client.query(`INSERT INTO profiles (user_id, links, interests) VALUES ($1,$2,$3) ON CONFLICT (user_id) DO NOTHING`, [user.id, JSON.stringify({}), JSON.stringify([])]);
  } catch (err) {
    // ignore
  }
  return true;
}

export async function getUserByUsername(username: string) {
  if (!connected) throw new Error('db-not-connected');
  const res = await client.query('SELECT id, username, email, password_hash, display_name, bio, avatar_url, verified, role, created_at FROM users WHERE username = $1 LIMIT 1', [username]);
  return res.rows[0] || null;
}

export async function getProfileByUsername(username: string) {
  if (!connected) throw new Error('db-not-connected');
  const res = await client.query(`SELECT u.id, u.username, u.email, u.display_name, u.bio, u.avatar_url, u.verified, p.links, p.interests, p.stats FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.username = $1 LIMIT 1`, [username]);
  return res.rows[0] || null;
}

export async function listItems(page = 1, pageSize = 12) {
  if (!connected) throw new Error('db-not-connected');
  const offset = (page - 1) * pageSize;
  const res = await client.query('SELECT id, user_id, title, description, status, created_at FROM items ORDER BY created_at DESC LIMIT $1 OFFSET $2', [pageSize, offset]);
  return res.rows;
}

export async function createInteraction(userId: string, itemId: string, type: string) {
  if (!connected) throw new Error('db-not-connected');
  await client.query('INSERT INTO interactions (user_id, item_id, type, created_at) VALUES ($1,$2,$3,now())', [userId, itemId, type]);
}

export async function listSavedItemIdsByUser(userId: string) {
  if (!connected) throw new Error('db-not-connected');
  const res = await client.query("SELECT item_id FROM interactions WHERE user_id = $1 AND type = 'save' ORDER BY created_at DESC", [userId]);
  return res.rows.map((r: any) => r.item_id);
}

export async function getItemsByIds(ids: string[]) {
  if (!connected) throw new Error('db-not-connected');
  if (!ids.length) return [];
  const res = await client.query('SELECT id, user_id, title, description, status, created_at FROM items WHERE id = ANY($1)', [ids]);
  return res.rows;
}

export default client;
