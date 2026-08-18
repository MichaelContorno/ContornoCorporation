import { readPublicJson } from "@/app/_lib/public-json";
import { cleanString, clientHash, ensureDatabase, validEmail } from "@/db/runtime";

const CONSENT_VERSION = "website-updates-2026-08-18";
const MAX_REQUEST_BYTES = 8 * 1024;
const PENDING_MESSAGE = "Your request has been recorded. Our team will send a secure confirmation link before updates begin.";

export async function POST(request: Request) {
  try {
    const parsed = await readPublicJson(request, MAX_REQUEST_BYTES);
    if (parsed.response) return parsed.response;
    const body = parsed.body;
    if (cleanString(body.website, 120)) {
      return Response.json({ message: PENDING_MESSAGE }, { status: 202 });
    }

    const firstName = cleanString(body.firstName, 80);
    const email = cleanString(body.email, 160).toLowerCase();
    const consent = cleanString(body.consent, 8);
    if (!firstName || !validEmail(email) || consent !== "yes") {
      return Response.json({ message: "Please enter your first name, a valid email address, and confirm your consent." }, { status: 400 });
    }
    const DB = await ensureDatabase();
    const hash = await clientHash(request);
    const now = Date.now();
    const hourCutoff = now - 60 * 60 * 1000;
    const dayCutoff = now - 24 * 60 * 60 * 1000;
    const clientHashCutoff = now - 48 * 60 * 60 * 1000;
    await DB.prepare("UPDATE subscribers SET client_hash = '' WHERE client_hash <> '' AND updated_at < ?")
      .bind(clientHashCutoff).run();
    const [recentClient, existingEmail] = await Promise.all([
      DB.prepare("SELECT COUNT(*) AS count FROM subscribers WHERE client_hash = ? AND updated_at >= ?")
        .bind(hash, hourCutoff).first<{ count: number }>(),
      DB.prepare("SELECT updated_at, active, status, unsubscribed_at FROM subscribers WHERE email = ?")
        .bind(email).first<{ updated_at: number; active: number; status: string; unsubscribed_at: number | null }>(),
    ]);
    if ((recentClient?.count ?? 0) >= 5) {
      return Response.json({ message: "We have received your recent update requests. Please try again later." }, { status: 429 });
    }
    if (
      existingEmail
      && (existingEmail.active || existingEmail.status !== "pending" || existingEmail.unsubscribed_at !== null || existingEmail.updated_at >= dayCutoff)
    ) {
      return Response.json({ message: PENDING_MESSAGE }, { status: 202 });
    }

    await DB.prepare(`INSERT INTO subscribers (
      id, created_at, updated_at, first_name, email, active, status,
      consent_version, consented_at, source, client_hash, unsubscribed_at
    ) VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?, 'website-updates', ?, NULL)
    ON CONFLICT(email) DO UPDATE SET
      updated_at = excluded.updated_at,
      first_name = excluded.first_name,
      consent_version = excluded.consent_version,
      consented_at = excluded.consented_at,
      source = excluded.source,
      client_hash = excluded.client_hash
    WHERE subscribers.status = 'pending'
      AND subscribers.active = 0
      AND subscribers.unsubscribed_at IS NULL`)
      .bind(crypto.randomUUID(), now, now, firstName, email, CONSENT_VERSION, now, hash).run();
    return Response.json({ message: PENDING_MESSAGE }, { status: 202 });
  } catch {
    return Response.json({ message: "We could not complete your subscription right now." }, { status: 500 });
  }
}
