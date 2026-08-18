import type { Metadata } from "next";
import { ServicePage } from "@/app/_components/ServicePage";

export const metadata: Metadata = {
  title: "Criminal Defense Investigations",
  description: "Strategic criminal defense case analysis and private investigation support.",
};

export default function InvestigationsPage() {
  return <ServicePage
    eyebrow="Contorno Criminal Defense Strategies & Investigations"
    title="Private investigations built for the defense"
    intro="We support defense attorneys with thorough, strategic investigation and case analysis designed to uncover key evidence, test assumptions, and clarify the facts that matter."
    ctaHref="/attorney-intake"
    ctaLabel="Start attorney case intake"
    highlights={[
      { title: "Case-file analysis", text: "A disciplined review of reports, timelines, witness accounts, digital records, and evidentiary gaps to identify issues that warrant deeper investigation." },
      { title: "Witness development", text: "Professional witness location, outreach, interviews, and statement documentation performed with discretion and respect for the legal process." },
      { title: "Evidence strategy", text: "Actionable investigative findings organized for counsel, with clear sourcing, chronology, and follow-up priorities." },
      { title: "Scene and timeline work", text: "Site visits, chronology reconstruction, record correlation, and fact-pattern testing tailored to the theory of defense." },
    ]}
    process={[
      { title: "Confidential consultation", text: "Counsel outlines the charge, posture of the case, deadlines, and immediate investigative priorities." },
      { title: "Scoped work plan", text: "We define objectives, sources, deliverables, timing, and authorization before work begins." },
      { title: "Investigation and analysis", text: "The approved plan is executed with organized documentation and timely communication." },
      { title: "Defense-ready reporting", text: "Findings, source notes, supporting materials, and next-step recommendations are delivered to counsel." },
    ]}
    disclaimer="Investigative services are provided within the scope of applicable law and licensure. No attorney-client relationship is created by visiting this site or submitting an inquiry."
  />;
}
