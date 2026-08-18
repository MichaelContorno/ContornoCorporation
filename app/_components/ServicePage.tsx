import Link from "next/link";
import { BrandShell } from "./BrandShell";

export type ServicePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  status?: string;
  highlights: { title: string; text: string }[];
  process: { title: string; text: string }[];
  disclaimer: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function ServicePage({ eyebrow, title, intro, status, highlights, process, disclaimer, ctaHref = "/contact", ctaLabel = "Request a consultation" }: ServicePageProps) {
  return (
    <BrandShell>
      <main>
        <section className="service-hero">
          <div className="content-wrap narrow">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {status && <span className="status-pill">{status}</span>}
            <p className="hero-copy">{intro}</p>
            <Link className="gold-button inline-button" href={ctaHref}>{ctaLabel}</Link>
          </div>
        </section>
        <section className="content-section">
          <div className="content-wrap">
            <p className="eyebrow">Focused service</p>
            <h2>How we support the matter at hand</h2>
            <div className="feature-grid">
              {highlights.map((item) => (
                <article className="feature-card" key={item.title}>
                  <span className="diamond">◇</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="content-section alternate">
          <div className="content-wrap">
            <p className="eyebrow">Clear next steps</p>
            <h2>Our process</h2>
            <ol className="process-list">
              {process.map((item, index) => (
                <li key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{item.title}</h3><p>{item.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="license-band">
          <div className="content-wrap"><p>{disclaimer}</p></div>
        </section>
      </main>
    </BrandShell>
  );
}
