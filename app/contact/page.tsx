import type { Metadata } from "next";
import { BrandShell } from "@/app/_components/BrandShell";
import { ContactForm } from "@/app/_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Request a confidential consultation with The Contorno Corporation.",
};

export default function ContactPage() {
  return (
    <BrandShell>
      <main className="content-section contact-page">
        <div className="content-wrap contact-layout">
          <section>
            <p className="eyebrow">Contact us</p>
            <h1>Choose the right starting point</h1>
            <p className="hero-copy">Defense counsel can use the structured attorney intake. For community management, bail-bond updates, or general questions, use the standard inquiry form.</p>
            <div className="privacy-note">
              <h2>Before you submit</h2>
              <p>Do not include Social Security numbers, payment details, evidence files, privileged documents, or sensitive medical information. Neither form creates a professional relationship or is monitored for emergencies or filing deadlines.</p>
            </div>
          </section>
          <ContactForm />
        </div>
      </main>
    </BrandShell>
  );
}
