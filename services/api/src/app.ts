import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import Fastify from "fastify";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createAIAdapter, type LogoVariant } from "@productdesignos/ai";
import { inspireTiles, profiles, trends } from "./seed";
import { initDb, isConnected, createUser, getUserByUsername, getProfileByUsername, listItems } from './db';

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  passwordHash: string;
  bio?: string;
  avatar?: string;
  profileData?: Record<string, unknown>;
};

type AIJob = {
  id: string;
  userId?: string;
  type: "logo";
  input: unknown;
  status: "queued" | "complete" | "failed";
  outputs: LogoVariant[];
};

const users = new Map<string, User>();
const providers = new Map<string, unknown>();
const jobs = new Map<string, AIJob>();

for (const profile of profiles) {
  users.set(profile.username, {
    ...profile,
    passwordHash: ""
  });
}

const jwtSecret = process.env.JWT_SECRET || "dev-secret";
const ai = createAIAdapter(process.env.AI_PROVIDER);

initDb();

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.register(rateLimit, { max: 60, timeWindow: "1 minute" });

  app.get("/health", async () => ({ ok: true }));

  app.get("/api/inspire", async (request) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      filter: z.string().optional()
    }).parse(request.query);

    const pageSize = 12;
    const filtered = query.filter
      ? inspireTiles.filter((tile) => tile.category.toLowerCase() === query.filter?.toLowerCase())
      : inspireTiles;
    const start = (query.page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      page: query.page,
      hasMore: start + pageSize < filtered.length
    };
  });

  app.get("/api/trends", async () => ({ items: trends }));

  // simple in-memory fallback for interactions when DB unavailable
  const interactionsMemory = new Map<string, Set<string>>(); // userId -> set(itemId)

  function getAuthFromHeader(request: any) {
    try {
      const auth = request.headers?.authorization as string | undefined;
      if (!auth) return null;
      const parts = auth.split(' ');
      if (parts.length !== 2) return null;
      const token = parts[1];
      const payload = jwt.verify(token, jwtSecret) as any;
      return { id: payload.sub as string, username: payload.username as string };
    } catch (err) {
      return null;
    }
  }

  app.post('/api/items/:id/save', async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const auth = getAuthFromHeader(request);
    if (!auth) return reply.code(401).send({ error: 'Unauthorized' });
    const userId = auth.id;
    if (isConnected()) {
      try {
        await (await import('./db')).createInteraction(userId, params.id, 'save');
        return { ok: true };
      } catch (err) {
        // fallback to memory
      }
    }
    const set = interactionsMemory.get(userId) || new Set<string>();
    set.add(params.id);
    interactionsMemory.set(userId, set);
    return { ok: true, fallback: true };
  });

  app.post('/api/items/:id/like', async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const auth = getAuthFromHeader(request);
    if (!auth) return reply.code(401).send({ error: 'Unauthorized' });
    const userId = auth.id;
    if (isConnected()) {
      try {
        await (await import('./db')).createInteraction(userId, params.id, 'like');
        return { ok: true };
      } catch (err) {
        // fallback
      }
    }
    const set = interactionsMemory.get(userId) || new Set<string>();
    set.add(params.id);
    interactionsMemory.set(userId, set);
    return { ok: true, fallback: true };
  });

  app.get('/api/me/saved', async (request, reply) => {
    const auth = getAuthFromHeader(request);
    if (!auth) return reply.code(401).send({ error: 'Unauthorized' });
    const userId = auth.id;
    if (isConnected()) {
      try {
        const ids = await (await import('./db')).listSavedItemIdsByUser(userId);
        const items = await (await import('./db')).getItemsByIds(ids);
        return { items };
      } catch (err) {
        return { items: [] };
      }
    }
    const set = interactionsMemory.get(userId) || new Set<string>();
    const ids = Array.from(set);
    // fallback: return empty since items aren't in DB
    return { items: [] };
  });

  // waitlist endpoint: write to Postgres if available else keep in-memory
  const waitlistMemory: Array<{ name?: string; email: string; created_at: string }> = [];
  app.post('/api/waitlist', async (request, reply) => {
    const body = z.object({ name: z.string().optional(), email: z.string().email() }).parse(request.body);
    const now = new Date().toISOString();
    if (isConnected()) {
      try {
        // use raw query to insert
        await (await import('./db')).default.query('INSERT INTO waitlist (name, email, created_at) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING', [body.name || null, body.email, now]);
        return { ok: true };
      } catch (err) {
        waitlistMemory.push({ name: body.name, email: body.email, created_at: now });
        return { ok: true, fallback: true };
      }
    }
    waitlistMemory.push({ name: body.name, email: body.email, created_at: now });
    return { ok: true, fallback: true };
  });

  app.post("/api/auth/signup", async (request, reply) => {
    const body = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["student", "influencer", "provider"])
    }).parse(request.body);

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user: User = {
      id: nanoid(),
      username: body.username,
      email: body.email,
      role: body.role,
      passwordHash,
      profileData: { tagline: "Designing a signature." }
    };
    if (isConnected()) {
      try {
        const tag = user.profileData && typeof user.profileData['tagline'] === 'string' ? String(user.profileData['tagline']) : undefined;
        await createUser({ id: user.id, username: user.username, email: user.email, password_hash: user.passwordHash, display_name: tag, role: user.role });
      } catch (err) {
        // fall back to in-memory
        users.set(user.username, user);
      }
    } else {
      users.set(user.username, user);
    }
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return { token, user: publicUser(user) };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const body = z.object({
      username: z.string(),
      password: z.string()
    }).parse(request.body);
    if (isConnected()) {
      try {
        const dbUser = await getUserByUsername(body.username);
        if (!dbUser || !dbUser.password_hash || !(await bcrypt.compare(body.password, dbUser.password_hash))) {
          return reply.code(401).send({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ sub: dbUser.id, username: dbUser.username, role: dbUser.role }, jwtSecret, { expiresIn: "7d" });
        const safeUser = { id: dbUser.id, username: dbUser.username, email: dbUser.email, display_name: dbUser.display_name, bio: dbUser.bio, avatar: dbUser.avatar_url };
        return { token, user: safeUser };
      } catch (err) {
        // fallback
      }
    }
    const user = users.get(body.username);
    if (!user || !user.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return { token, user: publicUser(user) };
  });

  app.get("/api/profile/:username", async (request, reply) => {
    const params = z.object({ username: z.string() }).parse(request.params);
    if (isConnected()) {
      try {
        const profile = await getProfileByUsername(params.username);
        if (!profile) return reply.code(404).send({ error: 'Profile not found' });
        return { profile };
      } catch (err) {
        // fallback
      }
    }
    const user = users.get(params.username);
    if (!user) return reply.code(404).send({ error: "Profile not found" });
    return { profile: publicUser(user) };
  });

  app.get('/api/items', async (request) => {
    const query = z.object({ page: z.coerce.number().int().min(1).default(1) }).parse(request.query);
    if (isConnected()) {
      try {
        const items = await listItems(query.page, 12);
        return { items, page: query.page };
      } catch (err) {
        return { items: [], page: query.page };
      }
    }
    // fallback to inspireTiles
    const pageSize = 12;
    const start = (query.page - 1) * pageSize;
    return { items: inspireTiles.slice(start, start + pageSize), page: query.page };
  });

  app.post("/api/ai/logo", { config: { rateLimit: { max: 12, timeWindow: "1 minute" } } }, async (request) => {
    const body = z.object({
      name: z.string().min(1),
      personality: z.string().min(1),
      colorMood: z.string().default("neon"),
      style: z.enum(["minimal", "geometric", "hand-drawn"]).default("minimal"),
      formats: z.array(z.enum(["svg", "png"])).default(["svg"])
    }).parse(request.body);
    const id = nanoid();
    const job: AIJob = { id, type: "logo", input: body, status: "queued", outputs: [] };
    jobs.set(id, job);
    job.outputs = await ai.generateLogo(body);
    job.status = "complete";
    return { jobId: id, status: job.status };
  });

  app.get("/api/ai/job/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const job = jobs.get(params.id);
    if (!job) return reply.code(404).send({ error: "Job not found" });
    return job;
  });

  app.post("/api/providers", async (request) => {
    const body = z.object({
      username: z.string().min(3),
      categories: z.array(z.string()).min(1),
      capabilities: z.array(z.string()).min(1),
      portfolio: z.array(z.string()).min(3),
      samplePricing: z.string().optional()
    }).parse(request.body);
    const id = nanoid();
    const provider = { id, approved: false, ...body };
    providers.set(id, provider);
    return { provider };
  });

  app.post("/api/privacy/delete", async (request) => {
    const body = z.object({ username: z.string() }).parse(request.body);
    users.delete(body.username);
    return { ok: true };
  });

  return app;
}

function publicUser(user: User) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
