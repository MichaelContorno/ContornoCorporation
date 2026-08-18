import Link from "next/link";
import type { ReactNode } from "react";
import { companyLinks, policyLinks, serviceLinks } from "@/app/_lib/site-links";
import { PrimaryNavigation } from "./PrimaryNavigation";

export function BrandShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="inner-header">
        <Link href="/" className="masthead-link" aria-label="The Contorno Corporation home">
          <span className="masthead-image" aria-hidden="true" />
        </Link>
        <PrimaryNavigation />
      </header>
      <div id="main-content">{children}</div>
      <footer className="site-footer">
        <div className="footer-brand">
          <p>The Contorno Corporation</p>
          <p>Excellence in investigation. Integrity in defense. Results that matter.</p>
        </div>
        <div className="footer-link-grid">
          <nav aria-label="Company links">
            <h2>Company</h2>
            {companyLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <nav aria-label="Service links">
            <h2>Services</h2>
            {serviceLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <nav aria-label="Policy and access links">
            <h2>Policies &amp; Access</h2>
            {policyLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            <Link href="/admin">Admin Sign In</Link>
          </nav>
        </div>
        <p className="footer-copyright">Copyright © 2026 The Contorno Corporation. All rights reserved.</p>
      </footer>
    </div>
  );
}
