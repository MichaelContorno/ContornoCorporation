import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the PostgreSQL migration.");
}

const REQUIRED_SCHEMA_VERSION = 4;
const expectedColumns = {
  app_schema_state: ["id", "version", "updated_at"],
  assistant_requests: ["id", "created_at", "client_hash"],
  leads: ["id", "created_at", "updated_at", "status", "first_name", "last_name", "email", "phone", "service", "message", "source", "client_hash", "consent_version", "consented_at"],
  subscribers: ["id", "created_at", "updated_at", "first_name", "email", "active", "status", "consent_version", "consented_at", "source", "client_hash", "unsubscribed_at", "confirmation_token_hash", "confirmation_expires_at", "verified_at", "verification_method"],
  attorney_intakes: ["id", "reference_code", "created_at", "updated_at", "status", "attorney_first_name", "attorney_last_name", "firm_name", "email", "phone", "submitter_role", "preferred_contact", "time_zone", "best_contact_time", "bar_jurisdiction", "bar_number", "client_name", "known_aliases", "matter_caption", "case_number", "court_jurisdiction", "prosecuting_agency", "related_parties", "custody_status", "urgency", "critical_date_type", "critical_date", "services_requested", "investigative_objective", "consent_version", "source", "client_hash", "retention_review_at"],
  documents: ["id", "created_at", "updated_at", "status", "intake_id", "source", "uploaded_by_user_id", "uploaded_by_email", "display_name", "storage_key", "original_name", "content_type", "size_bytes", "sha256"],
  document_audit_events: ["id", "created_at", "document_id", "actor_user_id", "actor_email", "action"],
};
const expectedIndexes = [
  "idx_assistant_requests_client_created",
  "idx_leads_created_at",
  "idx_leads_status_created_at",
  "idx_leads_client_created_at",
  "idx_leads_email_created_at",
  "idx_subscribers_email",
  "idx_subscribers_confirmation_token",
  "idx_subscribers_client_updated_at",
  "idx_subscribers_status_updated_at",
  "idx_attorney_intakes_reference_code",
  "idx_attorney_intakes_created_at",
  "idx_attorney_intakes_status_created_at",
  "idx_attorney_intakes_critical_date",
  "idx_attorney_intakes_client_created_at",
  "idx_attorney_intakes_email_created_at",
  "idx_documents_storage_key",
  "idx_documents_created_at",
  "idx_documents_status_created_at",
  "idx_documents_intake_id",
  "idx_document_audit_document_created",
];
const appTables = Object.keys(expectedColumns);

const statements = [
  `CREATE TABLE app_schema_state (
    id SMALLINT PRIMARY KEY,
    version INTEGER NOT NULL,
    updated_at BIGINT NOT NULL
  )`,
  `CREATE TABLE assistant_requests (
    id TEXT PRIMARY KEY NOT NULL,
    created_at BIGINT NOT NULL,
    client_hash TEXT NOT NULL
  )`,
  "CREATE INDEX idx_assistant_requests_client_created ON assistant_requests (client_hash, created_at)",
  `CREATE TABLE leads (
    id TEXT PRIMARY KEY NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'website',
    client_hash TEXT NOT NULL,
    consent_version TEXT NOT NULL,
    consented_at BIGINT NOT NULL
  )`,
  "CREATE INDEX idx_leads_created_at ON leads (created_at)",
  "CREATE INDEX idx_leads_status_created_at ON leads (status, created_at)",
  "CREATE INDEX idx_leads_client_created_at ON leads (client_hash, created_at)",
  "CREATE INDEX idx_leads_email_created_at ON leads (email, created_at)",
  `CREATE TABLE subscribers (
    id TEXT PRIMARY KEY NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    first_name TEXT NOT NULL,
    email TEXT NOT NULL,
    active SMALLINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    consent_version TEXT NOT NULL,
    consented_at BIGINT NOT NULL,
    source TEXT NOT NULL DEFAULT 'website-updates',
    client_hash TEXT NOT NULL DEFAULT '',
    unsubscribed_at BIGINT,
    confirmation_token_hash TEXT,
    confirmation_expires_at BIGINT,
    verified_at BIGINT,
    verification_method TEXT NOT NULL DEFAULT ''
  )`,
  "CREATE UNIQUE INDEX idx_subscribers_email ON subscribers (email)",
  "CREATE UNIQUE INDEX idx_subscribers_confirmation_token ON subscribers (confirmation_token_hash)",
  "CREATE INDEX idx_subscribers_client_updated_at ON subscribers (client_hash, updated_at)",
  "CREATE INDEX idx_subscribers_status_updated_at ON subscribers (status, updated_at)",
  `CREATE TABLE attorney_intakes (
    id TEXT PRIMARY KEY NOT NULL,
    reference_code TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
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
    retention_review_at BIGINT NOT NULL
  )`,
  "CREATE UNIQUE INDEX idx_attorney_intakes_reference_code ON attorney_intakes (reference_code)",
  "CREATE INDEX idx_attorney_intakes_created_at ON attorney_intakes (created_at)",
  "CREATE INDEX idx_attorney_intakes_status_created_at ON attorney_intakes (status, created_at)",
  "CREATE INDEX idx_attorney_intakes_critical_date ON attorney_intakes (critical_date)",
  "CREATE INDEX idx_attorney_intakes_client_created_at ON attorney_intakes (client_hash, created_at)",
  "CREATE INDEX idx_attorney_intakes_email_created_at ON attorney_intakes (email, created_at)",
  `CREATE TABLE documents (
    id TEXT PRIMARY KEY NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ready',
    intake_id TEXT,
    source TEXT NOT NULL,
    uploaded_by_user_id TEXT NOT NULL,
    uploaded_by_email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    original_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256 TEXT NOT NULL
  )`,
  "CREATE UNIQUE INDEX idx_documents_storage_key ON documents (storage_key)",
  "CREATE INDEX idx_documents_created_at ON documents (created_at)",
  "CREATE INDEX idx_documents_status_created_at ON documents (status, created_at)",
  "CREATE INDEX idx_documents_intake_id ON documents (intake_id)",
  `CREATE TABLE document_audit_events (
    id TEXT PRIMARY KEY NOT NULL,
    created_at BIGINT NOT NULL,
    document_id TEXT NOT NULL,
    actor_user_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL
  )`,
  "CREATE INDEX idx_document_audit_document_created ON document_audit_events (document_id, created_at)",
];

const client = new Client({ connectionString: databaseUrl });

async function getApplicationTables() {
  const result = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = ANY($1::text[])",
    [appTables],
  );
  return new Set(result.rows.map((row) => String(row.tablename)));
}

async function verifySchema() {
  const columnsResult = await client.query(
    "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
    [appTables],
  );
  const presentColumns = new Map(appTables.map((table) => [table, new Set()]));
  for (const row of columnsResult.rows) presentColumns.get(String(row.table_name))?.add(String(row.column_name));

  const missingColumns = Object.entries(expectedColumns).flatMap(([table, columns]) =>
    columns.filter((column) => !presentColumns.get(table)?.has(column)).map((column) => `${table}.${column}`),
  );
  if (missingColumns.length) {
    throw new Error(`PostgreSQL schema is incomplete; missing columns: ${missingColumns.join(", ")}. Use a verified migration or a fresh database.`);
  }

  const indexesResult = await client.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = ANY($1::text[])",
    [appTables],
  );
  const presentIndexes = new Set(indexesResult.rows.map((row) => String(row.indexname)));
  const missingIndexes = expectedIndexes.filter((name) => !presentIndexes.has(name));
  if (missingIndexes.length) {
    throw new Error(`PostgreSQL schema is incomplete; missing indexes: ${missingIndexes.join(", ")}. Use a verified migration or a fresh database.`);
  }
}

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(841581204)");

  const tables = await getApplicationTables();
  if (tables.has("app_schema_state")) {
    const state = await client.query("SELECT version FROM app_schema_state WHERE id = 1");
    if (state.rows[0]?.version !== REQUIRED_SCHEMA_VERSION) {
      throw new Error("This PostgreSQL database is not a verified Contorno schema v4 database. Use a fresh database or a separately approved data migration.");
    }
    await verifySchema();
    console.log("PostgreSQL schema is already ready.");
  } else {
    if (tables.size) {
      throw new Error("Existing Contorno tables were found without schema state. Refusing to overwrite or guess at a data migration.");
    }
    for (const statement of statements) await client.query(statement);
    await client.query(
      "INSERT INTO app_schema_state (id, version, updated_at) VALUES (1, $1, $2)",
      [REQUIRED_SCHEMA_VERSION, Date.now()],
    );
    await verifySchema();
    console.log("PostgreSQL schema is ready.");
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error("PostgreSQL migration failed.", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
