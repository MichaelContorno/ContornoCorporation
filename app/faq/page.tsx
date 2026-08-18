import type { Metadata } from "next";
import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";

export const metadata: Metadata = {
  title: "Questions & Answers",
  description: "Answers to common questions about The Contorno Corporation and its service lines.",
  openGraph: {
    title: "Questions & Answers | The Contorno Corporation",
    description: "Clear answers about investigations, Ratchet Bail Bonds, association management, and website inquiries.",
    images: [],
  },
  twitter: {
    title: "Questions & Answers | The Contorno Corporation",
    description: "Clear answers about investigations, Ratchet Bail Bonds, association management, and website inquiries.",
    images: [],
  },
};

const faqs = [
  { question: "What does The Contorno Corporation do?", answer: "The Contorno Corporation is the parent organization for criminal-defense investigation support, the planned Ratchet Bail Bonds service, and community association management. Each service line has its own scope and availability." },
  { question: "Is Ratchet Bail Bonds currently available?", answer: "No. Ratchet Bail Bonds is coming soon and is not currently posting bonds or accepting bond transactions through this website. If you need immediate assistance, contact an active licensed bail bond provider in the appropriate jurisdiction." },
  { question: "Who are the investigation services designed for?", answer: "The investigation service is designed primarily to support criminal-defense counsel. Other inquiries may be reviewed to determine whether they fit the available service scope." },
  { question: "What may an investigation include?", answer: "Depending on the matter and written authorization, work may include case-file analysis, witness development, scene or timeline review, record correlation, and organized reporting. The specific scope is established before work begins." },
  { question: "Can you guarantee an investigative result, bond, release, or association outcome?", answer: "No. Outcomes are never guaranteed. Service acceptance, timing, availability, and results depend on the circumstances, applicable requirements, and separately agreed terms." },
  { question: "Does submitting an inquiry create a professional relationship?", answer: "No. A website form, concierge conversation, or initial contact does not create an investigator-client, bail bond, management, fiduciary, or attorney-client relationship. An engagement begins only after review and written agreement." },
  { question: "What should I include in my inquiry?", answer: "Provide basic contact information, the service you need, relevant timing, and a short description. Do not submit evidence, privileged documents, Social Security numbers, payment information, identification documents, or sensitive medical information through the website." },
  { question: "How does an association management inquiry begin?", answer: "It begins with an introductory conversation about the association’s location, size, priorities, current operations, and desired scope. If the request is a potential fit, next steps and any proposed services are documented separately." },
  { question: "Where are services available?", answer: "Availability varies by service, location, scope, and applicable professional requirements. The company will confirm whether it can consider a request after reviewing the intake information." },
  { question: "What can the AI Concierge do?", answer: "The concierge can explain service categories, answer general routing questions, and help prepare a callback request. It cannot provide legal advice, approve a bond, evaluate an emergency, predict an outcome, or make a binding commitment." },
  { question: "How quickly will someone respond?", answer: "Inquiries are reviewed as soon as reasonably practicable during normal business operations. The website is not monitored for emergencies or time-critical release assistance." },
  { question: "Where can I verify professional license information?", answer: "Verified license information will be displayed on the applicable service page when confirmed. The licensee or entity name, license type, jurisdiction, and number must match the official record." },
] as const;

export default function FaqPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <BrandShell>
      <main className="faq-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <section className="service-hero">
          <div className="content-wrap narrow">
            <p className="eyebrow">Questions &amp; Answers</p>
            <h1>Clear answers before you get started</h1>
            <p className="hero-copy">These answers provide general information about our services and website. Specific availability, scope, timing, and terms are confirmed only after an inquiry is reviewed.</p>
          </div>
        </section>
        <section className="content-section">
          <div className="content-wrap faq-layout">
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details className="faq-item" key={faq.question} open={index === 0}>
                  <summary><span>{faq.question}</span><span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
            <aside className="faq-contact-card">
              <p className="eyebrow">Still have a question?</p>
              <h2>Start with the right service.</h2>
              <p>Send a short inquiry and a representative will review it before responding.</p>
              <Link className="gold-button" href="/contact">Contact Us</Link>
            </aside>
          </div>
        </section>
      </main>
    </BrandShell>
  );
}
