import Link from "next/link";
import { serviceLinks } from "@/app/_lib/site-links";

export function PrimaryNavigation({ showBrand = false }: { showBrand?: boolean }) {
  return (
    <>
      <div className={`primary-nav-wrap${showBrand ? " with-brand" : ""}`}>
        {showBrand && (
          <Link className="compact-brand" href="/" aria-label="The Contorno Corporation home">
            <span className="compact-brand-mark" aria-hidden="true">◇</span>
            <span><strong>The Contorno</strong><small>Corporation</small></span>
          </Link>
        )}
        <div className="desktop-primary-nav">
          <nav className="site-nav" aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <details className="services-menu">
              <summary>Services</summary>
              <div className="services-menu-panel">
                {serviceLinks.map((service) => <Link key={service.href} href={service.href}>{service.label}</Link>)}
              </div>
            </details>
            <Link href="/faq">Q&amp;A</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <Link className="header-cta" href="/contact">Request a consultation</Link>
        </div>
        <details className="mobile-primary-menu">
          <summary>Menu</summary>
          <nav aria-label="Mobile primary navigation">
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <span>Services</span>
            {serviceLinks.map((service) => <Link className="mobile-service-link" key={service.href} href={service.href}>{service.label}</Link>)}
            <Link href="/faq">Q&amp;A</Link>
            <Link href="/contact">Contact</Link>
            <Link className="header-cta" href="/contact">Request a consultation</Link>
          </nav>
        </details>
      </div>
      <Link className="announcement-bar" href="/services/bail-bonds"><strong>Ratchet Bail Bonds</strong><span>Coming Soon</span></Link>
    </>
  );
}
