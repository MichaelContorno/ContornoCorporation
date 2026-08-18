import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, cookieSecurityOptions } from "@/app/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const returnTo = new URL(request.url).searchParams.get("return_to") ?? "/";
  const destination = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...cookieSecurityOptions(0), maxAge: 0 });
  return response;
}
