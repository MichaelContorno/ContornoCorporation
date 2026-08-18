import type { Metadata } from "next";
import { BrandShell } from "@/app/_components/BrandShell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <BrandShell><main className="legal-page"><div className="content-wrap narrow">
    <p className="eyebrow">Privacy</p><h1>Privacy policy</h1>
    <p>Last updated August 18, 2026</p>
    <h2>Information you provide</h2><p>We collect contact details, service selections, and inquiry text that you voluntarily submit through the website. Attorney intake may also include professional credentials, limited conflict-screening names, matter identifiers, scheduling information, and a high-level investigative objective. Newsletter signups include a first name and email address.</p>
    <h2>How information is used</h2><p>We use submitted information to respond to inquiries, route requests to the appropriate business, maintain service records, protect the website, and send updates when requested.</p>
    <h2>AI concierge</h2><p>Messages sent to the concierge may be processed by an AI service to provide general routing information. Do not submit evidence, privileged communications, government identification numbers, payment data, or other highly sensitive information.</p>
    <h2>Retention and security</h2><p>We retain information only as reasonably necessary for business, legal, and security purposes. Reasonable safeguards are used, but no internet transmission or storage system can be guaranteed completely secure.</p>
    <h2>Protected documents</h2><p>PDFs accepted after intake review are stored in private document storage and made available only through the authenticated administrator area. Document access and administrative actions may be recorded for security and accountability.</p>
    <h2>Your choices</h2><p>You may request correction or deletion of contact information, or unsubscribe from updates, by contacting The Contorno Corporation through the website.</p>
  </div></main></BrandShell>;
}
