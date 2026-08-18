import type { Metadata } from "next";
import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";
import { siteRoutes } from "@/app/_lib/site-links";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore criminal defense investigations, Ratchet Bail Bonds updates, and community association management from The Contorno Corporation.",
  openGraph: {
    title: "Services | The Contorno Corporation",
    description: "Explore the Contorno Corporation service lines and choose the right starting point.",
    images: [],
  },
  twitter: {
    title: "Services | The Contorno Corporation",
    description: "Explore the Contorno Corporation service lines and choose the right starting point.",
    images: [],
  },
};

const services = [
  {
    eyebrow: "01 · Investigations",
    title: "Criminal defense strategies & investigations",
    body: "Strategic case analysis and investigative support for defense counsel, built around a confirmed scope, careful documentation, and clear reporting.",
    href: siteRoutes.investigations,
    action: "Explore investigations",
  },
  {
    eyebrow: "02 · Coming soon",
    title: "Ratchet Bail Bonds",
    body: "A planned service line for responsive bail bond support. It is not currently posting bonds or accepting bond transactions through this website.",
    href: siteRoutes.bailBonds,
    action: "View bail bond updates",
  },
  {
    eyebrow: "03 · Community",
    title: "Community association management",
    body: "Operational support for condominium and community association boards, including communication, vendor coordination, planning, and documented follow-through.",
    href: siteRoutes.communityManagement,
    action: "Explore community management",
  },
] as const;

export default function ServicesPage() {
  return (
    <BrandShell>
      <main className="services-overview-page">
        <section className="service-hero">
          <div className="content-wrap narrow">
            <p className="eyebrow">Our services</p>
            <h1>One organization. Three distinct lines of service.</h1>
            <p className="hero-copy">Start with the service that best fits your need. Availability, scope, timing, and professional requirements are reviewed before any service is accepted.</p>
          </div>
        </section>

        <section className="content-section">
          <div className="content-wrap">
            <p className="eyebrow">Choose your starting point</p>
            <h2>Explore each service directly</h2>
            <div className="services-overview-grid">
              {services.map((service) => (
                <article className="services-overview-card" key={service.href}>
                  <p className="eyebrow">{service.eyebrow}</p>
                  <h3>{service.title}</h3>
                  <p>{service.body}</p>
                  <Link href={service.href}>{service.action} <span aria-hidden="true">›</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section alternate">
          <div className="content-wrap services-overview-cta">
            <div>
              <p className="eyebrow">Not sure where to begin?</p>
              <h2>We’ll help route your inquiry.</h2>
              <p>Send a short, non-sensitive overview. A representative will review the request and respond through the appropriate service line.</p>
            </div>
            <Link className="gold-button" href={siteRoutes.contact}>Contact Us</Link>
          </div>
        </section>
      </main>
    </BrandShell>
  );
}
