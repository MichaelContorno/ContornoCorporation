import { NextResponse } from "next/server";
import {
  ADMIN_OAUTH_STATE_COOKIE,
  cookieSecurityOptions,
  createOAuthState,
  githubOAuthConfig,
  oauthStateLifetime,
} from "@/app/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = githubOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/admin/login?error=configuration", request.url));
  }
  const returnTo = new URL(request.url).searchParams.get("return_to");
  const state = createOAuthState(returnTo);
  const authorization = new URL("https://github.com/login/oauth/authorize");
  authorization.searchParams.set("client_id", config.clientId);
  authorization.searchParams.set("redirect_uri", `${config.origin}/api/admin/oauth/callback`);
  authorization.searchParams.set("scope", "read:user user:email");
  authorization.searchParams.set("state", state.state);
  const response = NextResponse.redirect(authorization);
  response.cookies.set(ADMIN_OAUTH_STATE_COOKIE, state.cookieValue, cookieSecurityOptions(oauthStateLifetime));
  return response;
}
