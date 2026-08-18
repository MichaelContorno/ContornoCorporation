import { readPublicJson } from "@/app/_lib/public-json";
import { cleanString, clientHash, ensureDatabase, validEmail } from "@/db/runtime";

const allowedServices = new Set(["investigations", "bail-bonds", "community-management", "general"]);
const CONSENT_VERSION = "general-inquiry-2026-08-18";
const MAX_REQUEST_BYTES = 16 * 1024;

export async function POST(request: Request) {
  try {
    const parsed = await readPublicJson(request, MAX_REQUEST_BYTES);
    if (parsed.response) return parsed.response;
    const body = parsed.body;
    if (cleanString(body.website, 120)) {
      return Response.json({ message: "Your confidential request has been received." }, { status: 201 });
    }

    const firstName = cleanString(body.firstName, 80);
    const lastName = cleanString(body.lastName, 80);
    const email = cleanString(body.email, 160).toLowerCase();
    const phone = cleanString(body.phone, 30);
    const service = cleanString(body.service, 40);
    const message = cleanString(body.message, 2000);
    const consent = cleanString(body.consent, 8);

    if (!firstName || !lastName || !validEmail(email) || !phone || !message || !allowedServices.has(service) || consent !== "yes") {
      return Response.json({ message: "Please complete every required field with valid information." }, { status: 400 });
    }

    const DB = await ensureDatabase();
    const hash = await clientHash(request);
    const now = Date.now();
    const hourCutoff = now - 60 * 60 * 1000;
    const dayCutoff = now - 24 * 60 * 60 * 1000;
    const clientHashCutoff = now - 48 * 60 * 60 * 1000;
    await DB.prepare("UPDATE leads SET client_hash = '' WHERE client_hash <> '' AND created_at < ?")
      .bind(clientHashCutoff).run();
    const [recentClient, recentEmail] = await Promise.all([
      DB.prepare("SELECT COUNT(*) AS count FROM leads WHERE client_hash = ? AND created_at >= ?")
        .bind(hash, hourCutoff).first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) AS count FROM leads WHERE email = ? AND created_at >= ?")
        .bind(email, dayCutoff).first<{ count: number }>(),
    ]);
    if ((recentClient?.count ?? 0) >= 5 || (recentEmail?.count ?? 0) >= 10) {
      return Response.json({ message: "We have received your recent requests. Please allow our team time to respond." }, { status: 429 });
    }

    await DB.prepare(`INSERT INTO leads
      (id, created_at, updated_at, status, first_name, last_name, email, phone, service, message, source, client_hash, consent_version, consented_at)
      VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, 'website', ?, ?, ?)`)
      .bind(crypto.randomUUID(), now, now, firstName, lastName, email, phone, service, message, hash, CONSENT_VERSION, now).run();

    return Response.json({ message: "Your confidential request has been received. A member of the team will follow up using the contact information provided." }, { status: 201 });
  } catch {
    return Response.json({ message: "We could not submit your request right now. Please try again shortly." }, { status: 500 });
  }
}
