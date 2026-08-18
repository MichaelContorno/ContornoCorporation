import type { Metadata } from "next";
import { BrandShell } from "@/app/_components/BrandShell";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <BrandShell><main className="legal-page"><div className="content-wrap narrow">
    <p className="eyebrow">Website terms</p><h1>Terms of service</h1>
    <p>Last updated August 18, 2026</p>
    <h2>Informational website</h2><p>This website provides general information about The Contorno Corporation and its affiliated services. Website content is not legal advice and does not create an attorney-client, investigator-client, bail bond, fiduciary, or management relationship.</p>
    <h2>Attorney intake</h2><p>The attorney intake is limited to conflict screening, scheduling, and preliminary scope review. Submission does not mean that a matter has been accepted, does not obligate The Contorno Corporation to act, and does not provide emergency or deadline monitoring. Do not submit evidence, privileged strategy, protected health information, government identifiers, or payment information through the public intake.</p>
    <h2>No guarantees</h2><p>Investigative outcomes, bond availability or release, association results, schedules, and service acceptance are never guaranteed. Engagements require separate review and written terms.</p>
    <h2>Ratchet Bail Bonds</h2><p>Ratchet Bail Bonds is identified as coming soon. The website is not currently offering to execute or post a bond, and no visitor should rely on it for emergency or time-critical release assistance.</p>
    <h2>Acceptable use</h2><p>You may not misuse the website, attempt unauthorized access, interfere with its operation, submit unlawful material, or impersonate another person.</p>
    <h2>AI concierge</h2><p>The concierge provides general service routing only. It may be inaccurate and cannot provide legal advice, approve a bond, assess an emergency, or make binding commitments.</p>
  </div></main></BrandShell>;
}
