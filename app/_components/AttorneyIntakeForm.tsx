"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { attorneyServiceOptions } from "@/app/_lib/attorney-intake";

type IntakeResult = { message?: string; referenceCode?: string };

export function AttorneyIntakeForm() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult({ message: "Submitting your intake securely…" });
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data);
    const services = data.getAll("services");
    if (services.length === 0) {
      setResult({ message: "Select at least one requested investigative service." });
      setBusy(false);
      window.setTimeout(() => statusRef.current?.focus(), 0);
      return;
    }
    try {
      const response = await fetch("/api/attorney-intakes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, services }),
      });
      const next = await response.json() as IntakeResult;
      setResult(next);
      if (response.ok) form.reset();
    } catch {
      setResult({ message: "We could not submit the intake right now. Please try again shortly." });
    } finally {
      setBusy(false);
      window.setTimeout(() => statusRef.current?.focus(), 0);
    }
  }

  return (
    <form className="attorney-intake-form lead-form" onSubmit={submit}>
      <div className="form-safety-note" id="intake-safety-note">
        <strong>Submit only what is needed for conflict screening and scheduling.</strong>
        <p>Do not include or upload evidence, privileged communications, defense strategy, protected health information, government identifiers, payment information, or other sensitive material. If the matter is accepted, the team will provide a protected document process.</p>
      </div>

      <fieldset>
        <legend><span>01</span> Counsel and firm</legend>
        <div className="field-row">
          <label>Attorney first name<input name="attorneyFirstName" minLength={2} maxLength={80} autoComplete="given-name" required /></label>
          <label>Attorney last name<input name="attorneyLastName" minLength={2} maxLength={80} autoComplete="family-name" required /></label>
        </div>
        <label>Firm or office name<input name="firmName" minLength={2} maxLength={160} autoComplete="organization" required /></label>
        <div className="field-row">
          <label>Work email<input name="email" type="email" maxLength={160} autoComplete="email" required /></label>
          <label>Confirm work email<input name="confirmEmail" type="email" maxLength={160} autoComplete="off" required /></label>
        </div>
        <div className="field-row">
          <label>Direct phone<input name="phone" type="tel" minLength={7} maxLength={30} autoComplete="tel" required /></label>
          <label>Submitter role<select name="submitterRole" defaultValue="attorney" required>
            <option value="attorney">Attorney</option>
            <option value="paralegal">Paralegal or law-firm staff</option>
            <option value="public-defender">Public defender office representative</option>
            <option value="other">Other authorized representative</option>
          </select></label>
        </div>
        <div className="field-row">
          <label>Bar jurisdiction<input name="barJurisdiction" minLength={2} maxLength={100} placeholder="State or jurisdiction" required /></label>
          <label>Bar number <span className="optional">Optional</span><input name="barNumber" maxLength={40} /></label>
        </div>
        <div className="field-row">
          <label>Preferred contact<select name="preferredContact" defaultValue="email" required><option value="email">Email</option><option value="phone">Phone</option></select></label>
          <label>Time zone<select name="timeZone" defaultValue="Eastern Time" required>
            <option>Eastern Time</option><option>Central Time</option><option>Mountain Time</option><option>Pacific Time</option><option>Alaska Time</option><option>Hawaii Time</option><option>Other</option>
          </select></label>
        </div>
        <label>Best contact time <span className="optional">Optional</span><input name="bestContactTime" maxLength={120} placeholder="Example: Weekdays after 2:00 PM" /></label>
      </fieldset>

      <fieldset>
        <legend><span>02</span> Conflict-screening information</legend>
        <p className="fieldset-help">Names and routing details only. Do not describe evidence or defense strategy in this section.</p>
        <label>Client&apos;s full legal name<input name="clientName" minLength={2} maxLength={160} required /></label>
        <label>Known aliases <span className="optional">Optional</span><input name="knownAliases" maxLength={300} /></label>
        <label>Matter or case caption<input name="matterCaption" minLength={2} maxLength={200} placeholder="State v. Client Name" required /></label>
        <div className="field-row">
          <label>Case number <span className="optional">Optional</span><input name="caseNumber" maxLength={100} /></label>
          <label>Court, county, and state<input name="courtJurisdiction" minLength={2} maxLength={200} required /></label>
        </div>
        <label>Prosecuting or law-enforcement agency <span className="optional">Optional</span><input name="prosecutingAgency" maxLength={160} /></label>
        <label>Related-party names and roles <span className="optional">Optional</span><textarea name="relatedParties" rows={4} maxLength={1000} placeholder="Name — alleged victim; Name — co-defendant. Names and roles only." /></label>
      </fieldset>

      <fieldset>
        <legend><span>03</span> Scope and timing</legend>
        <fieldset className="checkbox-fieldset">
          <legend>Requested services <span>Select at least one</span></legend>
          <div className="checkbox-grid">
            {attorneyServiceOptions.map(([value, label]) => <label className="check-option" key={value}><input type="checkbox" name="services" value={value} /> {label}</label>)}
          </div>
        </fieldset>
        <div className="field-row">
          <label>Custody status<select name="custodyStatus" defaultValue="unknown" required><option value="detained">Detained</option><option value="released">Released</option><option value="unknown">Unknown</option></select></label>
          <label>Requested timing<select name="urgency" defaultValue="one-week" required>
            <option value="two-business-days">Within 2 business days</option>
            <option value="one-week">Within 1 week</option>
            <option value="two-four-weeks">Within 2–4 weeks</option>
            <option value="planning">Planning / no fixed deadline</option>
          </select></label>
        </div>
        <div className="field-row">
          <label>Critical date type <span className="optional">Optional</span><input name="criticalDateType" maxLength={80} placeholder="Hearing, trial, filing deadline" /></label>
          <label>Critical date <span className="optional">Optional</span><input name="criticalDate" type="date" /></label>
        </div>
        <p className="field-hint">If you enter a critical date, complete both fields. This website is not monitored for emergencies or filing deadlines.</p>
        <label>Investigative objective<textarea name="investigativeObjective" rows={7} minLength={20} maxLength={1500} aria-describedby="objective-help" required /></label>
        <p className="field-hint" id="objective-help">Describe the requested task and desired deliverable at a high level. Do not include defense strategy, evidence contents, privileged advice, or highly sensitive personal data.</p>
      </fieldset>

      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" aria-label="Leave this field empty" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="consent"><input name="consent" type="checkbox" value="yes" required /> <span>I confirm that I am an attorney or authorized law-firm representative; I have reviewed the <Link href="/privacy">Privacy Policy</Link>; and I understand that submission does not create a professional engagement, obligate The Contorno Corporation to act, or provide emergency or deadline monitoring.</span></label>
      <button className="gold-button" type="submit" disabled={busy}>{busy ? "Submitting securely…" : "Submit attorney intake"}</button>
      {result && <div className="intake-result" ref={statusRef} tabIndex={-1} role="status">
        {result.referenceCode && result.referenceCode !== "CTN-RECEIVED" && <strong>Reference: {result.referenceCode}</strong>}
        <p>{result.message}</p>
      </div>}
    </form>
  );
}
