import { authorizeAdminApi } from "@/app/admin-access";
import { cleanString, ensureDatabase } from "@/db/runtime";

type Context = { params: Promise<{ id: string }> };

const CONFIRMATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

function json(body: Record<string, unknown>, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("cache-control", "private, no-store");
  return Response.json(body, { ...init, headers });
}

function base64Url(bytes: Uint8Array) {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdminApi(request, true);
  if (auth.error) return auth.error;

  let action = "";
  try {
    const body = await request.json() as Record<string, unknown>;
    action = cleanString(body.action, 40);
  } catch {
    return json({ message: "The subscriber action could not be read." }, { status: 400 });
  }

  try {
    const { id: rawId } = await context.params;
    const id = cleanString(rawId, 100);
    if (!id) return json({ message: "The subscriber could not be found." }, { status: 404 });

    const DB = await ensureDatabase();
    const now = Date.now();

    if (action === "issue-confirmation") {
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = base64Url(tokenBytes);
      const tokenHash = await sha256(token);
      const expiresAt = now + CONFIRMATION_LIFETIME_MS;
      const result = await DB.prepare(`UPDATE subscribers
        SET confirmation_token_hash = ?, confirmation_expires_at = ?, updated_at = ?
        WHERE id = ? AND status = 'pending' AND active = 0 AND unsubscribed_at IS NULL`)
        .bind(tokenHash, expiresAt, now, id).run();

      if (!result.meta.changes) {
        const subscriber = await DB.prepare("SELECT id FROM subscribers WHERE id = ?").bind(id).first();
        if (!subscriber) return json({ message: "The subscriber could not be found." }, { status: 404 });
        return json({ message: "A confirmation link can be issued only for a pending subscription." }, { status: 409 });
      }

      const confirmationUrl = new URL("/updates/confirm", new URL(request.url).origin);
      confirmationUrl.hash = `token=${token}`;
      return json({
        message: "A new confirmation link was issued. It expires in 24 hours.",
        confirmationUrl: confirmationUrl.toString(),
        expiresAt,
      });
    }

    if (action === "unsubscribe") {
      const result = await DB.prepare(`UPDATE subscribers
        SET status = 'unsubscribed', active = 0, unsubscribed_at = ?, updated_at = ?,
          confirmation_token_hash = NULL, confirmation_expires_at = NULL
        WHERE id = ?`)
        .bind(now, now, id).run();
      if (!result.meta.changes) return json({ message: "The subscriber could not be found." }, { status: 404 });
      return json({ message: "The email address was unsubscribed.", status: "unsubscribed", updatedAt: now });
    }

    return json({ message: "Choose a valid subscriber action." }, { status: 400 });
  } catch {
    return json({ message: "The subscriber could not be updated. Please try again." }, { status: 500 });
  }
}
