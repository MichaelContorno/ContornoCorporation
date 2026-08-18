import { getChatGPTUser } from "@/app/chatgpt-auth";
import { runtimeEnv } from "@/db/runtime";

export function isAllowedAdmin(email: string) {
  const configured = runtimeEnv().ADMIN_EMAILS ?? "";
  const allowed = configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function getAuthorizedAdmin() {
  const user = await getChatGPTUser();
  return user && isAllowedAdmin(user.email) ? user : null;
}

export async function authorizeAdminApi(request: Request, mutation = false) {
  const user = await getChatGPTUser();
  if (!user) return { user: null, error: Response.json({ message: "Sign in is required." }, { status: 401 }) };
  if (!isAllowedAdmin(user.email)) {
    return { user: null, error: Response.json({ message: "Administrator access is not authorized." }, { status: 403 }) };
  }
  if (mutation) {
    const origin = request.headers.get("origin");
    if (origin !== new URL(request.url).origin || request.headers.get("x-contorno-backoffice") !== "1") {
      return { user: null, error: Response.json({ message: "The back-office request could not be verified." }, { status: 403 }) };
    }
  }
  return { user, error: null };
}
