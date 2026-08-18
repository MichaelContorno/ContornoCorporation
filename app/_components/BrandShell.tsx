import Link from "next/link";
import type { ReactNode } from "react";
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
        <p>The Contorno Corporation</p>
        <p>Excellence in investigation. Integrity in defense. Results that matter.</p>
        <div><Link href="/about">About Us</Link><Link href="/attorney-intake">Attorney Intake</Link><Link href="/faq">Q&amp;A</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/admin">Admin</Link></div>
      </footer>
    </div>
  );
}
