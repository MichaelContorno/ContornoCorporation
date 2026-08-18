import { env } from "cloudflare:workers";

export type RuntimeEnv = {
  DB: D1Database;
  DOCUMENTS: R2Bucket;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  ADMIN_EMAILS?: string;
  RATE_LIMIT_SECRET?: string;
};

export function runtimeEnv(): RuntimeEnv {
  return env as unknown as RuntimeEnv;
}

let initialization: Promise<D1Database> | null = null;
const REQUIRED_SCHEMA_VERSION = 4;

async function initializeDatabase(DB: D1Database) {
  const state = await DB.prepare("SELECT version FROM app_schema_state WHERE id = 1")
    .first<{ version: number }>();
  if (state?.version !== REQUIRED_SCHEMA_VERSION) {
    throw new Error(`Database schema ${REQUIRED_SCHEMA_VERSION} must be applied before serving traffic.`);
  }
  await DB.prepare("PRAGMA optimize").run();
  return DB;
}

export async function ensureDatabase() {
  const { DB } = runtimeEnv();
  if (!DB) throw new Error("Database binding is unavailable");
  if (!initialization) {
    initialization = initializeDatabase(DB).catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export function documentsBucket() {
  const { DOCUMENTS } = runtimeEnv();
  if (!DOCUMENTS) throw new Error("Document storage binding is unavailable");
  return DOCUMENTS;
}

export async function clientHash(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const dateBucket = new Date().toISOString().slice(0, 10);
  const secret = runtimeEnv().RATE_LIMIT_SECRET?.trim();
  if (!secret) throw new Error("RATE_LIMIT_SECRET is required for public rate limiting.");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${dateBucket}:${forwarded.split(",")[0].trim()}`),
  );
  return Array.from(new Uint8Array(digest)).map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function cleanString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  const cleaned = Array.from(value.normalize("NFKC"), (character) => {
    const code = character.charCodeAt(0);
    const disallowed = code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127;
    return disallowed ? " " : character;
  }).join("");
  return cleaned.trim().slice(0, max);
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
