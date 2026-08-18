"use client";

import { useState } from "react";

export type AdminAttorneyIntake = {
  id: string;
  referenceCode: string;
  createdAt: number;
  status: string;
  attorneyName: string;
  firmName: string;
  email: string;
  phone: string;
  preferredContact: string;
  barJurisdiction: string;
  barNumber: string;
  clientName: string;
  knownAliases: string;
  matterCaption: string;
  caseNumber: string;
  courtJurisdiction: string;
  prosecutingAgency: string;
  relatedParties: string;
  custodyStatus: string;
  urgency: string;
  criticalDateType: string;
  criticalDate: string;
  services: string[];
  investigativeObjective: string;
};

const statuses = [
  ["new", "New"],
  ["reviewing", "Reviewing"],
  ["conflict-hold", "Conflict hold"],
  ["awaiting-counsel", "Awaiting counsel"],
  ["accepted", "Accepted"],
  ["declined", "Declined"],
  ["closed", "Closed"],
] as const;

export function AttorneyIntakeQueue({ initialIntakes }: { initialIntakes: AdminAttorneyIntake[] }) {
  const [intakes, setIntakes] = useState(initialIntakes);
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setNotice("Updating intake status…");
    try {
      const response = await fetch(`/api/admin/attorney-intakes/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-contorno-backoffice": "1" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json() as { message?: string };
      if (response.ok) setIntakes((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setNotice(result.message ?? "The status could not be updated.");
    } catch {
      setNotice("The status could not be updated.");
    } finally {
      setBusyId("");
    }
  }

  if (intakes.length === 0) return <p className="empty-state">No attorney intakes have been submitted yet.</p>;

  return (
    <div className="intake-admin-list">
      <p className="form-notice compact-notice" role="status">{notice}</p>
      {intakes.map((intake) => (
        <details className="intake-admin-card" key={intake.id}>
          <summary>
            <span><strong>{intake.referenceCode}</strong><small>{new Date(intake.createdAt).toLocaleString("en-US")}</small></span>
            <span><strong>{intake.attorneyName}</strong><small>{intake.firmName}</small></span>
            <span><strong>{intake.matterCaption}</strong><small>{intake.clientName}</small></span>
            <span className={`lead-status ${intake.status}`}>{intake.status.replace("-", " ")}</span>
          </summary>
          <div className="intake-admin-detail">
            <div className="admin-detail-grid">
              <section><h3>Counsel</h3><p>{intake.attorneyName}<br />{intake.firmName}<br />{intake.barJurisdiction}{intake.barNumber ? ` · Bar ${intake.barNumber}` : ""}</p><a href={`mailto:${intake.email}`}>{intake.email}</a><a href={`tel:${intake.phone}`}>{intake.phone}</a><p>Preferred: {intake.preferredContact}</p></section>
              <section><h3>Matter</h3><p><strong>Client:</strong> {intake.clientName}</p>{intake.knownAliases && <p><strong>Aliases:</strong> {intake.knownAliases}</p>}<p><strong>Caption:</strong> {intake.matterCaption}</p>{intake.caseNumber && <p><strong>Case:</strong> {intake.caseNumber}</p>}<p>{intake.courtJurisdiction}</p>{intake.prosecutingAgency && <p>{intake.prosecutingAgency}</p>}</section>
              <section><h3>Timing</h3><p><strong>Custody:</strong> {intake.custodyStatus}</p><p><strong>Requested:</strong> {intake.urgency.replaceAll("-", " ")}</p>{intake.criticalDate && <p><strong>{intake.criticalDateType}:</strong> {intake.criticalDate}</p>}</section>
            </div>
            {intake.relatedParties && <section className="admin-narrative"><h3>Related parties</h3><p>{intake.relatedParties}</p></section>}
            <section className="admin-narrative"><h3>Requested services</h3><ul>{intake.services.map((service) => <li key={service}>{service}</li>)}</ul></section>
            <section className="admin-narrative"><h3>Investigative objective</h3><p>{intake.investigativeObjective}</p></section>
            <label className="status-control">Workflow status<select value={intake.status} disabled={busyId === intake.id} onChange={(event) => updateStatus(intake.id, event.target.value)}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </div>
        </details>
      ))}
    </div>
  );
}
