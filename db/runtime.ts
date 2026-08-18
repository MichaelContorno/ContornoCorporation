import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Pool, types as pgTypes, type PoolClient, type QueryResultRow } from "pg";

// PostgreSQL represents BIGINT values as strings by default. Every timestamp in
// this app is a Date.now() millisecond value, which remains within JavaScript's
// safe integer range, so normalize it at the driver boundary.
pgTypes.setTypeParser(20, (value) => Number(value));

export type RuntimeEnv = {
  ADMIN_EMAILS?: string;
  ADMIN_GITHUB_CLIENT_ID?: string;
  ADMIN_GITHUB_CLIENT_SECRET?: string;
  ADMIN_SESSION_SECRET?: string;
  APP_ORIGIN?: string;
  DATABASE_URL?: string;
  DB_POOL_MAX?: string;
  NODE_ENV?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  RATE_LIMIT_SECRET?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_BUCKET?: string;
  S3_ENDPOINT?: string;
  S3_FORCE_PATH_STYLE?: string;
  S3_REGION?: string;
  S3_SECRET_ACCESS_KEY?: string;
};

export type DatabaseRunResult = { meta: { changes: number } };

export type DatabaseStatement = {
  bind(...values: unknown[]): DatabaseStatement;
  run(): Promise<DatabaseRunResult>;
  first<T extends QueryResultRow = QueryResultRow>(): Promise<T | null>;
  all<T extends QueryResultRow = QueryResultRow>(): Promise<{ results: T[] }>;
};

export type Database = {
  prepare(sql: string): DatabaseStatement;
  batch(statements: DatabaseStatement[]): Promise<DatabaseRunResult[]>;
};

export type DocumentsBucket = {
  put(key: string, body: ArrayBuffer, options: { contentType: string; documentId: string }): Promise<void>;
  get(key: string, options?: { range?: { offset: number; length: number } }): Promise<{ body: ReadableStream<Uint8Array> } | null>;
  delete(key: string): Promise<void>;
};

const REQUIRED_SCHEMA_VERSION = 4;
let databasePool: Pool | null = null;
let database: PostgresDatabase | null = null;
let initialization: Promise<Database> | null = null;
let storageClient: S3Client | null = null;

export function runtimeEnv(): RuntimeEnv {
  return process.env as RuntimeEnv;
}

function requiredSetting(name: keyof RuntimeEnv) {
  const value = runtimeEnv()[name]?.trim();
  if (!value) throw new Error(`${name} is required in the Railway service variables.`);
  return value;
}

function poolSize() {
  const value = Number(runtimeEnv().DB_POOL_MAX ?? "8");
  return Number.isInteger(value) && value >= 1 && value <= 20 ? value : 8;
}

function getPool() {
  if (!databasePool) {
    databasePool = new Pool({
      connectionString: requiredSetting("DATABASE_URL"),
      max: poolSize(),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    });
  }
  return databasePool;
}

function toPostgresPlaceholders(sql: string) {
  let parameterIndex = 0;
  return sql.replace(/\?/gu, () => `$${++parameterIndex}`);
}

class PostgresStatement implements DatabaseStatement {
  private readonly values: unknown[];

  constructor(
    private readonly sql: string,
    values: unknown[] = [],
  ) {
    this.values = values;
  }

  bind(...values: unknown[]) {
    return new PostgresStatement(this.sql, values);
  }

  async execute(client: Pool | PoolClient = getPool()) {
    return client.query({ text: toPostgresPlaceholders(this.sql), values: this.values });
  }

  async run(): Promise<DatabaseRunResult> {
    const result = await this.execute();
    return { meta: { changes: result.rowCount ?? 0 } };
  }

  async first<T extends QueryResultRow = QueryResultRow>(): Promise<T | null> {
    const result = await this.execute();
    return (result.rows[0] as T | undefined) ?? null;
  }

  async all<T extends QueryResultRow = QueryResultRow>(): Promise<{ results: T[] }> {
    const result = await this.execute();
    return { results: result.rows as T[] };
  }
}

class PostgresDatabase implements Database {
  prepare(sql: string): DatabaseStatement {
    return new PostgresStatement(sql);
  }

  async batch(statements: DatabaseStatement[]): Promise<DatabaseRunResult[]> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      const results: DatabaseRunResult[] = [];
      for (const statement of statements) {
        if (!(statement instanceof PostgresStatement)) {
          throw new Error("Database batches accept only statements created by this database instance.");
        }
        const result = await statement.execute(client);
        results.push({ meta: { changes: result.rowCount ?? 0 } });
      }
      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
}

function getDatabase() {
  if (!database) database = new PostgresDatabase();
  return database;
}

async function initializeDatabase(DB: Database) {
  const state = await DB.prepare("SELECT version FROM app_schema_state WHERE id = 1")
    .first<{ version: number }>();
  if (state?.version !== REQUIRED_SCHEMA_VERSION) {
    throw new Error(`Database schema ${REQUIRED_SCHEMA_VERSION} must be applied before serving traffic.`);
  }
  return DB;
}

export async function ensureDatabase(): Promise<Database> {
  if (!initialization) {
    initialization = initializeDatabase(getDatabase()).catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

function getStorageClient() {
  if (!storageClient) {
    storageClient = new S3Client({
      endpoint: requiredSetting("S3_ENDPOINT"),
      region: requiredSetting("S3_REGION"),
      forcePathStyle: runtimeEnv().S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: requiredSetting("S3_ACCESS_KEY_ID"),
        secretAccessKey: requiredSetting("S3_SECRET_ACCESS_KEY"),
      },
    });
  }
  return storageClient;
}

export function validateRuntimeConfiguration() {
  requiredSetting("DATABASE_URL");
  requiredSetting("RATE_LIMIT_SECRET");
  requiredSetting("S3_BUCKET");
  requiredSetting("S3_ENDPOINT");
  requiredSetting("S3_REGION");
  requiredSetting("S3_ACCESS_KEY_ID");
  requiredSetting("S3_SECRET_ACCESS_KEY");
}

export async function verifyDocumentsBucket() {
  validateRuntimeConfiguration();
  await getStorageClient().send(new HeadBucketCommand({ Bucket: requiredSetting("S3_BUCKET") }));
}

function asWebStream(body: unknown) {
  if (!body) return null;
  if (typeof (body as { transformToWebStream?: unknown }).transformToWebStream === "function") {
    return (body as { transformToWebStream: () => ReadableStream<Uint8Array> }).transformToWebStream();
  }
  if (typeof (body as { getReader?: unknown }).getReader === "function") {
    return body as ReadableStream<Uint8Array>;
  }
  return null;
}

export function documentsBucket(): DocumentsBucket {
  const bucket = requiredSetting("S3_BUCKET");
  const client = getStorageClient();
  return {
    async put(key, body, options) {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: new Uint8Array(body),
        ContentType: options.contentType,
        Metadata: { documentid: options.documentId },
      }));
    },
    async get(key, options) {
      const range = options?.range;
      try {
        const response = await client.send(new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          Range: range ? `bytes=${range.offset}-${range.offset + range.length - 1}` : undefined,
        }));
        const body = asWebStream(response.Body);
        return body ? { body } : null;
      } catch (error) {
        const details = error as { name?: string; $metadata?: { httpStatusCode?: number } };
        if (details.name === "NoSuchKey" || details.$metadata?.httpStatusCode === 404) return null;
        throw error;
      }
    },
    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}

export async function clientHash(request: Request) {
  const forwarded = request.headers.get("x-real-ip")
    ?? request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")
    ?? "unknown";
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
