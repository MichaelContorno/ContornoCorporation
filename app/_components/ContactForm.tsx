"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("Sending your confidential request…");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json() as { message?: string };
      setNotice(result.message ?? "Please try again.");
      if (response.ok) form.reset();
    } catch {
      setNotice("We could not submit your request right now. Please try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="contact-form-wrap">
      <div className="attorney-intake-prompt"><p className="eyebrow">Defense attorneys and legal staff</p><h2>Need investigative support for a represented matter?</h2><p>Use the structured intake for conflict screening, case timing, and requested scope.</p><Link className="gold-button" href="/attorney-intake">Open attorney case intake</Link></div>
      <form className="lead-form contact-form" onSubmit={submit}>
      <p className="eyebrow">General service inquiry</p>
      <div className="field-row">
        <label>First name<input name="firstName" maxLength={80} autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" maxLength={80} autoComplete="family-name" required /></label>
      </div>
      <div className="field-row">
        <label>Email<input name="email" type="email" maxLength={160} autoComplete="email" required /></label>
        <label>Phone<input name="phone" type="tel" maxLength={30} autoComplete="tel" required /></label>
      </div>
      <label>Service needed<select name="service" defaultValue="investigations" required>
        <option value="investigations">Private investigations / criminal defense analysis</option>
        <option value="bail-bonds">Ratchet Bail Bonds - coming soon</option>
        <option value="community-management">Community association management</option>
        <option value="general">General inquiry</option>
      </select></label>
      <label>How can we help?<textarea name="message" rows={6} maxLength={2000} required /></label>
      <label className="consent"><input name="consent" type="checkbox" value="yes" required /> I consent to be contacted about this request.</label>
      <button className="gold-button" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit confidential request"}</button>
      {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>
    </div>
  );
}
