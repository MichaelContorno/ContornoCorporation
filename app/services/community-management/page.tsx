import type { Metadata } from "next";
import { ServicePage } from "@/app/_components/ServicePage";

export const metadata: Metadata = {
  title: "Community Association Management",
  description: "Community association management focused on efficiency, security, and property value.",
};

export default function CommunityManagementPage() {
  return <ServicePage
    eyebrow="Contorno Community Association Management"
    title="Disciplined management for stronger communities"
    intro="We help condominium and community associations operate with clearer communication, consistent processes, responsible oversight, and a long-term view of property value."
    highlights={[
      { title: "Board support", text: "Meeting preparation, action tracking, governance calendars, and clear reporting that help volunteer boards make informed decisions." },
      { title: "Resident communication", text: "Consistent notices, request handling, issue routing, and service updates designed to reduce confusion and improve trust." },
      { title: "Vendor coordination", text: "Organized scopes, bid support, scheduling, performance follow-up, and documentation for routine and capital work." },
      { title: "Operational oversight", text: "Preventive maintenance planning, compliance tracking, common-area inspections, and issue escalation focused on continuity and value." },
    ]}
    process={[
      { title: "Association discovery", text: "We review community needs, governance structure, current contracts, operational pressure points, and board priorities." },
      { title: "Management plan", text: "A practical service plan establishes responsibilities, communication cadence, reporting, and transition milestones." },
      { title: "Structured transition", text: "Records, vendors, resident communications, open projects, and recurring obligations are organized for continuity." },
      { title: "Ongoing accountability", text: "The board receives consistent updates, documented follow-through, and clear escalation when decisions are required." },
    ]}
    disclaimer="Community association management services are performed subject to applicable contracts, governing documents, law, and professional licensure. Service availability depends on association location and scope."
  />;
}
