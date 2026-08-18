import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_OAUTH_STATE_COOKIE,
  ADMIN_SESSION_COOKIE,
  cookieSecurityOptions,
  createAdminSession,
  githubOAuthConfig,
  isAllowedAdmin,
  readOAuthState,
  sessionLifetime,
} from "@/app/admin-auth";

type GitHubProfile = { id?: number; login?: string; name?: string | null };
type GitHubEmail = { email?: string; primary?: boolean; verified?: boolean };

function loginError(request: Request, code: string) {
  return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(code)}`, request.url));
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = githubOAuthConfig();
  if (!config) return loginError(request, "configuration");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const cookieStore = await cookies();
  const expected = readOAuthState(cookieStore.get(ADMIN_OAUTH_STATE_COOKIE)?.value);
  const suppliedState = url.searchParams.get("state");
  if (!code || !expected || !suppliedState || expected.state !== suppliedState) return loginError(request, "verification");

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: `${config.origin}/api/admin/oauth/callback`,
      }),
      cache: "no-store",
    });
    const token = await tokenResponse.json() as { access_token?: string };
    if (!tokenResponse.ok || !token.access_token) return loginError(request, "authorization");

    const headers = { accept: "application/vnd.github+json", authorization: `Bearer ${token.access_token}` };
    const profileResponse = await fetch("https://api.github.com/user", { headers, cache: "no-store" });
    const profile = await profileResponse.json() as GitHubProfile;
    if (!profileResponse.ok || !profile.id) return loginError(request, "authorization");

    const emailsResponse = await fetch("https://api.github.com/user/emails", { headers, cache: "no-store" });
    const emails = await emailsResponse.json() as GitHubEmail[];
    const verified = emails.find((candidate) => candidate.primary && candidate.verified)
      ?? emails.find((candidate) => candidate.verified);
    const email = emailsResponse.ok ? verified?.email?.trim().toLowerCase() ?? "" : "";
    if (!email || !isAllowedAdmin(email)) return loginError(request, "not-authorized");

    const session = await createAdminSession({
      userId: `github:${profile.id}`,
      email,
      displayName: profile.name?.trim() || profile.login?.trim() || email,
    });
    const response = NextResponse.redirect(new URL(expected.returnTo, config.origin));
    response.cookies.set(ADMIN_SESSION_COOKIE, session, cookieSecurityOptions(sessionLifetime));
    response.cookies.set(ADMIN_OAUTH_STATE_COOKIE, "", { ...cookieSecurityOptions(0), maxAge: 0 });
    return response;
  } catch {
    return loginError(request, "authorization");
  }
}
