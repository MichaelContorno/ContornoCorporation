import Link from "next/link";
import { serviceLinks, siteRoutes } from "@/app/_lib/site-links";

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
            <Link href={siteRoutes.home}>Home</Link>
            <Link href={siteRoutes.about}>About Us</Link>
            <Link href={siteRoutes.services}>Services</Link>
            <Link href={siteRoutes.mediaGallery}>Media Gallery</Link>
            <Link href={siteRoutes.faq}>Q&amp;A</Link>
            <Link href={siteRoutes.contact}>Contact</Link>
          </nav>
          <Link className="header-cta" href={siteRoutes.contact}>Request a consultation</Link>
        </div>
        <details className="mobile-primary-menu">
          <summary>Menu</summary>
          <nav aria-label="Mobile primary navigation">
            <Link href={siteRoutes.home}>Home</Link>
            <Link href={siteRoutes.about}>About Us</Link>
            <Link href={siteRoutes.services}>Services</Link>
            {serviceLinks.map((service) => <Link className="mobile-service-link" key={service.href} href={service.href}>{service.label}</Link>)}
            <Link href={siteRoutes.mediaGallery}>Media Gallery</Link>
            <Link href={siteRoutes.faq}>Q&amp;A</Link>
            <Link href={siteRoutes.contact}>Contact</Link>
            <Link className="header-cta" href={siteRoutes.contact}>Request a consultation</Link>
          </nav>
        </details>
      </div>
      <Link className="announcement-bar" href={siteRoutes.bailBonds}><strong>Ratchet Bail Bonds</strong><span>Coming Soon</span></Link>
    </>
  );
}
