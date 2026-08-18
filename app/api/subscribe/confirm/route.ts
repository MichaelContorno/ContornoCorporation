import { readPublicJson } from "@/app/_lib/public-json";
import { ensureDatabase } from "@/db/runtime";

const MAX_REQUEST_BYTES = 4 * 1024;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/u;

function json(body: Record<string, unknown>, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("cache-control", "no-store");
  headers.set("referrer-policy", "no-referrer");
  return Response.json(body, { ...init, headers });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const parsed = await readPublicJson(request, MAX_REQUEST_BYTES);
    if (parsed.response) return parsed.response;

    const token = typeof parsed.body.token === "string" ? parsed.body.token.trim() : "";
    if (!TOKEN_PATTERN.test(token)) {
      return json({ message: "This confirmation link is invalid, expired, or has already been used." }, { status: 400 });
    }

    const DB = await ensureDatabase();
    const now = Date.now();
    const tokenHash = await sha256(token);
    const result = await DB.prepare(`UPDATE subscribers
      SET status = 'active', active = 1, updated_at = ?, verified_at = ?,
        verification_method = 'email-link', confirmation_token_hash = NULL,
        confirmation_expires_at = NULL
      WHERE confirmation_token_hash = ?
        AND confirmation_expires_at > ?
        AND status = 'pending'
        AND active = 0
        AND unsubscribed_at IS NULL`)
      .bind(now, now, tokenHash, now).run();

    if (!result.meta.changes) {
      return json({ message: "This confirmation link is invalid, expired, or has already been used." }, { status: 400 });
    }

    return json({ message: "Your email address is confirmed. You are now subscribed to Contorno updates." });
  } catch {
    return json({ message: "We could not confirm your subscription right now. Please try again." }, { status: 500 });
  }
}
