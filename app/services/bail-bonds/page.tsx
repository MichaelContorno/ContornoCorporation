import type { Metadata } from "next";
import { ServicePage } from "@/app/_components/ServicePage";

export const metadata: Metadata = {
  title: "Ratchet Bail Bonds - Coming Soon",
  description: "Ratchet Bail Bonds is preparing fast, reliable bail bond support.",
};

export default function BailBondsPage() {
  return <ServicePage
    eyebrow="Ratchet Bail Bonds"
    title="Responsive bail bond support, coming soon"
    status="Coming soon"
    intro="Ratchet Bail Bonds is being established to provide clear, responsive support when families need to understand the release process and act quickly."
    ctaHref="/contact?service=bail-bonds"
    ctaLabel="Request launch updates"
    highlights={[
      { title: "Fast initial response", text: "A structured intake designed to collect the essential case, facility, and indemnitor information without unnecessary delay." },
      { title: "Plain-language guidance", text: "Clear explanations of the bond process, responsibilities, required documentation, and next steps." },
      { title: "Respectful family support", text: "Discreet, professional communication during a stressful and time-sensitive situation." },
      { title: "Availability updates", text: "Join the update list to receive launch information and service availability notices." },
    ]}
    process={[
      { title: "Request information", text: "Share the defendant name, detention location, booking details if known, and your preferred callback information." },
      { title: "Eligibility and bond review", text: "Once operational, a licensed professional will verify the bond and explain available options." },
      { title: "Documents and payment", text: "Required agreements, identification, collateral terms if applicable, and fees are reviewed before execution." },
      { title: "Posting and follow-through", text: "The bond is posted and the family receives clear information about continuing obligations." },
    ]}
    disclaimer="Ratchet Bail Bonds is coming soon and is not currently accepting or posting bonds through this website. No bond is guaranteed. Availability and terms are subject to licensure, underwriting, court requirements, and applicable law."
  />;
}
