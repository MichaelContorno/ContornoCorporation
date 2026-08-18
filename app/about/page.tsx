import type { Metadata } from "next";
import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about The Contorno Corporation and its investigation, planned bail bond, and community association management service lines.",
  openGraph: {
    title: "About The Contorno Corporation",
    description: "Focused service lines united by a clear standard of accountability.",
    images: [],
  },
  twitter: {
    title: "About The Contorno Corporation",
    description: "Focused service lines united by a clear standard of accountability.",
    images: [],
  },
};

const serviceLines = [
  {
    title: "Criminal Defense Strategies & Investigations",
    href: "/services/investigations",
    text: "Designed primarily to support criminal-defense counsel through carefully scoped case review and investigative work. Services and deliverables are confirmed in writing before work begins.",
  },
  {
    title: "Ratchet Bail Bonds",
    href: "/services/bail-bonds",
    status: "Coming soon",
    text: "A planned service that is not currently posting bonds or accepting bond transactions through this website. Launch timing and availability will be announced when confirmed.",
  },
  {
    title: "Community Association Management",
    href: "/services/community-management",
    text: "Support for condominium and community association boards through planning, communication, vendor coordination, and operational follow-through based on each association’s needs and written agreement.",
  },
] as const;

export default function AboutPage() {
  return (
    <BrandShell>
      <main className="about-page">
        <section className="service-hero about-hero">
          <div className="content-wrap narrow">
            <p className="eyebrow">About Us</p>
            <h1>Focused services. One standard of accountability.</h1>
            <p className="hero-copy">The Contorno Corporation is the parent organization for three distinct service lines. We provide a clear point of entry while each request is evaluated according to the scope, availability, location, and requirements of the applicable service.</p>
          </div>
        </section>

        <section className="content-section">
          <div className="content-wrap">
            <p className="eyebrow">Our businesses</p>
            <h2>Three distinct service lines</h2>
            <div className="about-service-grid">
              {serviceLines.map((service) => (
                <article key={service.href} className="about-service-card">
                  <span className="diamond" aria-hidden="true">◇</span>
                  <h3>{service.title}</h3>
                  {"status" in service && <span className="status-pill">{service.status}</span>}
                  <p>{service.text}</p>
                  <Link href={service.href}>Explore this service <span aria-hidden="true">›</span></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section alternate">
          <div className="content-wrap about-principles">
            <div>
              <p className="eyebrow">How we work</p>
              <h2>Clear expectations from the first conversation</h2>
            </div>
            <div>
              <p>Across our service lines, the approach is consistent: careful intake, clear expectations, organized work, respectful communication, and documented follow-through.</p>
              <p>We do not promise outcomes. A professional relationship begins only after the request has been reviewed and the parties agree to the applicable scope and written terms.</p>
            </div>
          </div>
        </section>

        <section className="content-section about-cta">
          <div className="content-wrap narrow">
            <p className="eyebrow">Start with a clear conversation</p>
            <h2>Tell us which service you need.</h2>
            <p className="hero-copy">A representative will review your request and respond using the information you provide. Service availability depends on location, scope, and applicable professional requirements.</p>
            <Link className="gold-button inline-button" href="/contact">Contact Us</Link>
          </div>
        </section>
      </main>
    </BrandShell>
  );
}
