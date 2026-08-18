import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";
import { attorneyServiceLabels } from "@/app/_lib/attorney-intake";
import { adminLogoutPath, requireAdminUser } from "@/app/admin-auth";
import { ensureDatabase } from "@/db/runtime";
import { AttorneyIntakeQueue, type AdminAttorneyIntake } from "./AttorneyIntakeQueue";
import { SubscriberQueue, type AdminSubscriber } from "./SubscriberQueue";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  created_at: number;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

type AttorneyIntakeRow = {
  id: string;
  reference_code: string;
  created_at: number;
  status: string;
  attorney_first_name: string;
  attorney_last_name: string;
  firm_name: string;
  email: string;
  phone: string;
  preferred_contact: string;
  bar_jurisdiction: string;
  bar_number: string;
  client_name: string;
  known_aliases: string;
  matter_caption: string;
  case_number: string;
  court_jurisdiction: string;
  prosecuting_agency: string;
  related_parties: string;
  custody_status: string;
  urgency: string;
  critical_date_type: string;
  critical_date: string;
  services_requested: string;
  investigative_objective: string;
};

type SubscriberRow = {
  id: string;
  created_at: number;
  updated_at: number;
  first_name: string;
  email: string;
  active: number;
  status: string;
  consented_at: number;
  verified_at: number | null;
  verification_method: string;
  unsubscribed_at: number | null;
};

function serviceList(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => attorneyServiceLabels[String(item)] ?? String(item));
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const user = await requireAdminUser("/admin");

  const DB = await ensureDatabase();
  const [leadRows, intakeRows, subscriberRows, subscriberCount, documentCount] = await Promise.all([
    DB.prepare("SELECT id, created_at, status, first_name, last_name, email, phone, service, message FROM leads ORDER BY created_at DESC LIMIT 100").all<Lead>(),
    DB.prepare(`SELECT id, reference_code, created_at, status, attorney_first_name, attorney_last_name,
      firm_name, email, phone, preferred_contact, bar_jurisdiction, bar_number, client_name,
      known_aliases, matter_caption, case_number, court_jurisdiction, prosecuting_agency,
      related_parties, custody_status, urgency, critical_date_type, critical_date,
      services_requested, investigative_objective
      FROM attorney_intakes ORDER BY created_at DESC LIMIT 100`).all<AttorneyIntakeRow>(),
    DB.prepare(`SELECT id, created_at, updated_at, first_name, email, active, status,
      consented_at, verified_at, verification_method, unsubscribed_at
      FROM subscribers ORDER BY updated_at DESC LIMIT 200`).all<SubscriberRow>(),
    DB.prepare(`SELECT
      SUM(CASE WHEN status = 'active' AND active = 1 THEN 1 ELSE 0 END) AS active_count,
      SUM(CASE WHEN status = 'pending' AND active = 0 THEN 1 ELSE 0 END) AS pending_count
      FROM subscribers`).first<{ active_count: number; pending_count: number }>(),
    DB.prepare("SELECT COUNT(*) AS count FROM documents WHERE status = 'ready'").first<{ count: number }>(),
  ]);
  const intakes: AdminAttorneyIntake[] = intakeRows.results.map((intake) => ({
    id: intake.id,
    referenceCode: intake.reference_code,
    createdAt: intake.created_at,
    status: intake.status,
    attorneyName: `${intake.attorney_first_name} ${intake.attorney_last_name}`,
    firmName: intake.firm_name,
    email: intake.email,
    phone: intake.phone,
    preferredContact: intake.preferred_contact,
    barJurisdiction: intake.bar_jurisdiction,
    barNumber: intake.bar_number,
    clientName: intake.client_name,
    knownAliases: intake.known_aliases,
    matterCaption: intake.matter_caption,
    caseNumber: intake.case_number,
    courtJurisdiction: intake.court_jurisdiction,
    prosecutingAgency: intake.prosecuting_agency,
    relatedParties: intake.related_parties,
    custodyStatus: intake.custody_status,
    urgency: intake.urgency,
    criticalDateType: intake.critical_date_type,
    criticalDate: intake.critical_date,
    services: serviceList(intake.services_requested),
    investigativeObjective: intake.investigative_objective,
  }));
  const newAttorneyCount = intakes.filter((intake) => intake.status === "new").length;
  const activeAttorneyCount = intakes.filter((intake) => !["declined", "closed"].includes(intake.status)).length;
  const subscribers: AdminSubscriber[] = subscriberRows.results.map((subscriber) => ({
    id: subscriber.id,
    createdAt: subscriber.created_at,
    updatedAt: subscriber.updated_at,
    firstName: subscriber.first_name,
    email: subscriber.email,
    active: Boolean(subscriber.active),
    status: subscriber.status === "active" || subscriber.status === "unsubscribed" ? subscriber.status : "pending",
    consentedAt: subscriber.consented_at,
    verifiedAt: subscriber.verified_at,
    verificationMethod: subscriber.verification_method || null,
    unsubscribedAt: subscriber.unsubscribed_at,
  }));

  return <BrandShell><main className="admin-page"><div className="content-wrap">
    <div className="admin-heading"><div><p className="eyebrow">Secure administration</p><h1>Contorno back office</h1><p>Signed in as {user.email}</p></div><a href={adminLogoutPath("/")}>Sign out</a></div>
    <nav className="admin-section-nav" aria-label="Back-office sections"><a href="#attorney-intakes">Attorney intakes</a><Link href="/admin/documents">PDF document center</Link><a href="#general-inquiries">General inquiries</a><a href="#update-requests">Update requests</a></nav>
    <div className="stat-grid admin-stat-grid">
      <article><strong>{newAttorneyCount}</strong><span>New attorney intakes</span></article>
      <article><strong>{activeAttorneyCount}</strong><span>Active intake reviews</span></article>
      <article><strong>{documentCount?.count ?? 0}</strong><span>Protected PDFs</span></article>
      <article><strong>{leadRows.results.length}</strong><span>Recent general inquiries</span></article>
    </div>
    <section className="backoffice-feature-card"><div><p className="eyebrow">Protected workspace</p><h2>PDF document center</h2><p>Upload, associate, read, download, and manage PDFs without exposing the storage bucket publicly.</p></div><Link className="gold-button" href="/admin/documents">Open document center</Link></section>
    <section className="admin-table-section" id="attorney-intakes"><div className="section-heading"><div><p className="eyebrow">Defense counsel workflow</p><h2>Attorney intake queue</h2></div><Link href="/attorney-intake">View public intake form</Link></div><AttorneyIntakeQueue initialIntakes={intakes} /></section>
    <section className="admin-table-section" id="general-inquiries"><div className="section-heading"><div><p className="eyebrow">All service lines</p><h2>General inquiries</h2></div><span>{leadRows.results.length} most recent</span></div>
      {leadRows.results.length === 0 ? <p className="empty-state">No general inquiries have been submitted yet.</p> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Contact</th><th>Service</th><th>Message</th><th>Status</th></tr></thead><tbody>{leadRows.results.map((lead) => <tr key={lead.id}><td>{new Date(lead.created_at).toLocaleString("en-US")}</td><td><strong>{lead.first_name} {lead.last_name}</strong><a href={`mailto:${lead.email}`}>{lead.email}</a><a href={`tel:${lead.phone}`}>{lead.phone}</a></td><td>{lead.service}</td><td>{lead.message}</td><td><span className={`lead-status ${lead.status}`}>{lead.status}</span></td></tr>)}</tbody></table></div>}
    </section>
    <section className="admin-table-section" id="update-requests"><div className="section-heading"><div><p className="eyebrow">Permission-based communications</p><h2>Email update requests</h2><p>Issue a one-time confirmation link, send it to the matching address from an official Contorno mailbox, and use Unsubscribe when a recipient opts out.</p></div><span>{subscriberCount?.active_count ?? 0} active · {subscriberCount?.pending_count ?? 0} pending</span></div><SubscriberQueue initialSubscribers={subscribers} /></section>
  </div></main></BrandShell>;
}
