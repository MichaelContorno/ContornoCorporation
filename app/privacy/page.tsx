import type { Metadata } from "next";
import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <BrandShell><main className="legal-page"><div className="content-wrap narrow">
    <p className="eyebrow">Privacy</p><h1>Privacy policy</h1>
    <p>Last updated August 18, 2026</p>
    <h2>Information you provide</h2><p>We collect contact details, service selections, inquiry text, and the version and time of your consent when you voluntarily submit a website form. Attorney intake may also include professional credentials, limited conflict-screening names, matter identifiers, scheduling information, and a high-level investigative objective. Update requests include a first name and email address.</p>
    <h2>How information is used</h2><p>We use submitted information to respond to inquiries, route requests to the appropriate business, maintain service records, protect the website, and send updates after the requesting email address is confirmed through a one-time link.</p>
    <h2>Website security data</h2><p>Public forms use limited request information for abuse prevention and rate limiting. The requesting network address is converted into a daily rotating, one-way token protected by a server secret; the original address is not stored in that field.</p>
    <h2>AI concierge</h2><p>Messages sent to the concierge may be processed by an AI service to provide general routing information. Do not submit evidence, privileged communications, government identification numbers, payment data, or other highly sensitive information.</p>
    <h2>Retention and security</h2><p>We retain information only as reasonably necessary for business, legal, and security purposes. Reasonable safeguards are used, but no internet transmission or storage system can be guaranteed completely secure.</p>
    <h2>Protected documents</h2><p>PDFs accepted after intake review are stored in private document storage and made available only through the authenticated administrator area. Document access and administrative actions may be recorded for security and accountability.</p>
    <h2>Your choices</h2><p>You may request correction or deletion of contact information, or unsubscribe from updates, through our <Link href="/contact">contact page</Link>.</p>
    <h2>Related terms</h2><p>Please also review the website <Link href="/terms">Terms of Service</Link>.</p>
  </div></main></BrandShell>;
}
