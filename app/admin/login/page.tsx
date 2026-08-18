import { BrandShell } from "@/app/_components/BrandShell";

type LoginPageProps = { searchParams: Promise<{ return_to?: string; error?: string }> };

const errorCopy: Record<string, string> = {
  authorization: "GitHub could not complete the sign-in request. Please try again.",
  configuration: "Administrator sign-in is not configured yet. Set the required Railway variables before using the back office.",
  "not-authorized": "This GitHub email address is not approved for the Contorno back office.",
  verification: "That sign-in link expired or could not be verified. Please try again.",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = params.return_to?.startsWith("/") && !params.return_to.startsWith("//") ? params.return_to : "/admin";
  const error = params.error ? errorCopy[params.error] : undefined;
  return (
    <BrandShell>
      <main className="admin-page">
        <div className="content-wrap narrow admin-login-card">
          <p className="eyebrow">Restricted area</p>
          <h1>Contorno back office</h1>
          <p>Sign in with the approved GitHub account for this organization. Access is limited to the administrator email allowlist.</p>
          {error && <p className="form-notice error" role="alert">{error}</p>}
          <a className="gold-button inline-button" href={`/api/admin/oauth?return_to=${encodeURIComponent(returnTo)}`}>Continue with GitHub</a>
        </div>
      </main>
    </BrandShell>
  );
}
