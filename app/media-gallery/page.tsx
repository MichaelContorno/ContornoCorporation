import type { Metadata } from "next";
import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";
import { siteRoutes } from "@/app/_lib/site-links";

export const metadata: Metadata = {
  title: "Media Gallery",
  description: "Official Contorno Corporation visual identity and service-line media.",
  openGraph: {
    title: "Media Gallery | The Contorno Corporation",
    description: "Explore official Contorno Corporation visual identity and service-line media.",
    images: [],
  },
  twitter: {
    title: "Media Gallery | The Contorno Corporation",
    description: "Explore official Contorno Corporation visual identity and service-line media.",
    images: [],
  },
};

const galleryItems = [
  {
    title: "The Contorno Corporation",
    description: "Official corporate identity and service-line overview.",
    href: siteRoutes.home,
    action: "Visit homepage",
    className: "media-gallery-tile--identity",
  },
  {
    title: "Criminal defense investigations",
    description: "Strategic investigation and case-analysis support for the defense.",
    href: siteRoutes.investigations,
    action: "Explore investigations",
    className: "media-gallery-tile--investigations",
  },
  {
    title: "Ratchet Bail Bonds",
    description: "An upcoming service line. Availability will be announced when confirmed.",
    href: siteRoutes.bailBonds,
    action: "View bail bond updates",
    className: "media-gallery-tile--bail",
  },
  {
    title: "Community association management",
    description: "Structured management support for stronger, well-run communities.",
    href: siteRoutes.communityManagement,
    action: "Explore community management",
    className: "media-gallery-tile--community",
  },
] as const;

export default function MediaGalleryPage() {
  return (
    <BrandShell>
      <main className="media-gallery-page">
        <section className="service-hero media-gallery-hero">
          <div className="content-wrap narrow">
            <p className="eyebrow">Media Gallery</p>
            <h1>The visual world of The Contorno Corporation</h1>
            <p className="hero-copy">Explore official brand media and each service line. The gallery uses the approved Contorno artwork as its source—no stock imagery or unapproved representations.</p>
          </div>
        </section>

        <section className="content-section">
          <div className="content-wrap">
            <p className="eyebrow">Official visual library</p>
            <h2>Identity, investigations, bonds, and community</h2>
            <div className="media-gallery-grid">
              {galleryItems.map((item) => (
                <article className={`media-gallery-tile ${item.className}`} key={item.href}>
                  {/* The approved artwork is reused without alteration as the gallery source. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/og.png" alt={`${item.title} official Contorno Corporation artwork`} width="1731" height="909" />
                  <div className="media-gallery-caption">
                    <p className="eyebrow">Official Media</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <Link href={item.href}>{item.action} <span aria-hidden="true">›</span></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section alternate">
          <div className="content-wrap media-gallery-note">
            <div>
              <p className="eyebrow">Media inquiries</p>
              <h2>Need official information or a business inquiry?</h2>
              <p>Use the contact page to request a response. Please do not use the website to submit confidential case materials or documents.</p>
            </div>
            <Link className="gold-button" href={siteRoutes.contact}>Contact Us</Link>
          </div>
        </section>
      </main>
    </BrandShell>
  );
}
