import { env } from "cloudflare:workers";

export type RuntimeEnv = {
  DB: D1Database;
  DOCUMENTS: R2Bucket;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  ADMIN_EMAILS?: string;
};

export function runtimeEnv(): RuntimeEnv {
  return env as unknown as RuntimeEnv;
}

let initialized = false;

export async function ensureDatabase() {
  const { DB } = runtimeEnv();
  if (!DB) throw new Error("Database binding is unavailable");
  if (initialized) return DB;

  await DB.batch([
    DB.prepare(`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'website',
      client_hash TEXT NOT NULL
    )`),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_leads_status_created_at ON leads(status, created_at)"),
    DB.prepare(`CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      email TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    )`),
    DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email)"),
    DB.prepare(`CREATE TABLE IF NOT EXISTS assistant_requests (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      client_hash TEXT NOT NULL
    )`),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_assistant_requests_client_created ON assistant_requests(client_hash, created_at)"),
    DB.prepare(`CREATE TABLE IF NOT EXISTS attorney_intakes (
      id TEXT PRIMARY KEY,
      reference_code TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      attorney_first_name TEXT NOT NULL,
      attorney_last_name TEXT NOT NULL,
      firm_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      submitter_role TEXT NOT NULL,
      preferred_contact TEXT NOT NULL,
      time_zone TEXT NOT NULL,
      best_contact_time TEXT NOT NULL DEFAULT '',
      bar_jurisdiction TEXT NOT NULL,
      bar_number TEXT NOT NULL DEFAULT '',
      client_name TEXT NOT NULL,
      known_aliases TEXT NOT NULL DEFAULT '',
      matter_caption TEXT NOT NULL,
      case_number TEXT NOT NULL DEFAULT '',
      court_jurisdiction TEXT NOT NULL,
      prosecuting_agency TEXT NOT NULL DEFAULT '',
      related_parties TEXT NOT NULL DEFAULT '',
      custody_status TEXT NOT NULL,
      urgency TEXT NOT NULL,
      critical_date_type TEXT NOT NULL DEFAULT '',
      critical_date TEXT NOT NULL DEFAULT '',
      services_requested TEXT NOT NULL,
      investigative_objective TEXT NOT NULL,
      consent_version TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'attorney-intake',
      client_hash TEXT NOT NULL,
      retention_review_at INTEGER NOT NULL
    )`),
    DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_attorney_intakes_reference_code ON attorney_intakes(reference_code)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_attorney_intakes_created_at ON attorney_intakes(created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_attorney_intakes_status_created_at ON attorney_intakes(status, created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_attorney_intakes_critical_date ON attorney_intakes(critical_date)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_attorney_intakes_client_created_at ON attorney_intakes(client_hash, created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_attorney_intakes_email_created_at ON attorney_intakes(email, created_at)"),
    DB.prepare(`CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      intake_id TEXT,
      source TEXT NOT NULL,
      uploaded_by_user_id TEXT NOT NULL,
      uploaded_by_email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      original_name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      sha256 TEXT NOT NULL
    )`),
    DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_storage_key ON documents(storage_key)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_documents_status_created_at ON documents(status, created_at)"),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_documents_intake_id ON documents(intake_id)"),
    DB.prepare(`CREATE TABLE IF NOT EXISTS document_audit_events (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      document_id TEXT NOT NULL,
      actor_user_id TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL
    )`),
    DB.prepare("CREATE INDEX IF NOT EXISTS idx_document_audit_document_created ON document_audit_events(document_id, created_at)"),
  ]);
  await DB.prepare("PRAGMA optimize").run();
  initialized = true;
  return DB;
}

export function documentsBucket() {
  const { DOCUMENTS } = runtimeEnv();
  if (!DOCUMENTS) throw new Error("Document storage binding is unavailable");
  return DOCUMENTS;
}

export async function clientHash(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const bytes = new TextEncoder().encode(`contorno:${forwarded.split(",")[0].trim()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
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
