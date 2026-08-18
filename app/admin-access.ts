import { getAdminUser, isAllowedAdmin } from "@/app/admin-auth";

export { isAllowedAdmin };

export async function getAuthorizedAdmin() {
  const user = await getAdminUser();
  return user && isAllowedAdmin(user.email) ? user : null;
}

export async function authorizeAdminApi(request: Request, mutation = false) {
  const user = await getAdminUser();
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
