import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import bcrypt from "bcryptjs";
import Fastify from "fastify";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createAIAdapter, type LogoVariant } from "@productdesignos/ai";
import { inspireTiles, profiles, trends } from "./seed";

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

  app.post("/api/auth/signup", async (request, reply) => {
    const body = z.object({
      username: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["student", "influencer", "provider"])
    }).parse(request.body);

    if (users.has(body.username)) {
      return reply.code(409).send({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user: User = {
      id: nanoid(),
      username: body.username,
      email: body.email,
      role: body.role,
      passwordHash,
      profileData: { tagline: "Designing a signature." }
    };
    users.set(user.username, user);
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return { token, user: publicUser(user) };
  });

  app.post("/api/auth/login", async (request, reply) => {
    const body = z.object({
      username: z.string(),
      password: z.string()
    }).parse(request.body);
    const user = users.get(body.username);
    if (!user || !user.passwordHash || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: "7d" });
    return { token, user: publicUser(user) };
  });

  app.get("/api/profile/:username", async (request, reply) => {
    const params = z.object({ username: z.string() }).parse(request.params);
    const user = users.get(params.username);
    if (!user) return reply.code(404).send({ error: "Profile not found" });
    return { profile: publicUser(user) };
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
