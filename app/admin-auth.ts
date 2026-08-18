import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { runtimeEnv } from "@/db/runtime";

export type AdminUser = {
  userId: string;
  email: string;
  displayName: string;
};

type SessionPayload = AdminUser & { issuedAt: number; expiresAt: number };
type OAuthState = { state: string; returnTo: string };

export const ADMIN_SESSION_COOKIE = "contorno_admin_session";
export const ADMIN_OAUTH_STATE_COOKIE = "contorno_admin_oauth_state";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const OAUTH_STATE_DURATION_SECONDS = 10 * 60;

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64UrlDecode(value: string) {
  const padded = `${value.replaceAll("-", "+").replaceAll("_", "/")}${"=".repeat((4 - value.length % 4) % 4)}`;
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function safeRelativeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  try {
    const parsed = new URL(value, "https://contorno.local");
    return parsed.origin === "https://contorno.local" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : "/admin";
  } catch {
    return "/admin";
  }
}

function randomValue() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function hmac(value: string) {
  const secret = runtimeEnv().ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function allowedAdminEmails() {
  const configured = runtimeEnv().ADMIN_EMAILS ?? "";
  return configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string) {
  return allowedAdminEmails().includes(email.trim().toLowerCase());
}

export function configuredAppOrigin() {
  const raw = runtimeEnv().APP_ORIGIN?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (runtimeEnv().NODE_ENV === "production" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function githubOAuthConfig() {
  const clientId = runtimeEnv().ADMIN_GITHUB_CLIENT_ID?.trim();
  const clientSecret = runtimeEnv().ADMIN_GITHUB_CLIENT_SECRET?.trim();
  const origin = configuredAppOrigin();
  const sessionSecret = runtimeEnv().ADMIN_SESSION_SECRET?.trim();
  if (!clientId || !clientSecret || !origin || !sessionSecret || sessionSecret.length < 32) return null;
  return { clientId, clientSecret, origin };
}

export function assertAdminConfiguration() {
  if (!githubOAuthConfig()) {
    throw new Error("GitHub OAuth, APP_ORIGIN, and ADMIN_SESSION_SECRET must be configured before serving traffic.");
  }
  if (!allowedAdminEmails().length) {
    throw new Error("ADMIN_EMAILS must include at least one verified administrator email address.");
  }
}

export function cookieSecurityOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: runtimeEnv().NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function createOAuthState(returnTo: string | null | undefined) {
  const state: OAuthState = { state: randomValue(), returnTo: safeRelativeReturnPath(returnTo) };
  return { state: state.state, cookieValue: base64UrlEncode(JSON.stringify(state)) };
}

export function readOAuthState(value: string | undefined) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(base64UrlDecode(value)) as Partial<OAuthState>;
    if (typeof parsed.state !== "string" || typeof parsed.returnTo !== "string" || parsed.state.length < 32) return null;
    return { state: parsed.state, returnTo: safeRelativeReturnPath(parsed.returnTo) };
  } catch {
    return null;
  }
}

export async function createAdminSession(user: AdminUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId: user.userId,
    email: user.email.trim().toLowerCase(),
    displayName: user.displayName || user.email,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_SECONDS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${await hmac(encoded)}`;
}

async function readAdminSession(value: string | undefined): Promise<AdminUser | null> {
  if (!value) return null;
  const [encoded, signature, extra] = value.split(".");
  if (!encoded || !signature || extra) return null;
  try {
    if (!constantTimeEqual(signature, await hmac(encoded))) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as Partial<SessionPayload>;
    if (
      typeof payload.userId !== "string"
      || typeof payload.email !== "string"
      || typeof payload.displayName !== "string"
      || typeof payload.expiresAt !== "number"
      || payload.expiresAt <= Math.floor(Date.now() / 1000)
      || !isAllowedAdmin(payload.email)
    ) return null;
    return { userId: payload.userId, email: payload.email, displayName: payload.displayName };
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  const store = await cookies();
  return readAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminUser(returnTo: string) {
  const user = await getAdminUser();
  if (user) return user;
  redirect(`/admin/login?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`);
}

export function adminLogoutPath(returnTo = "/") {
  return `/api/admin/logout?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export const oauthStateLifetime = OAUTH_STATE_DURATION_SECONDS;
export const sessionLifetime = SESSION_DURATION_SECONDS;
