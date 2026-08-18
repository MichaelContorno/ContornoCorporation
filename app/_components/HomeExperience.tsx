"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { PrimaryNavigation } from "./PrimaryNavigation";

type Panel = "lead" | "assistant" | "subscribe" | null;
type ChatMessage = { role: "user" | "assistant"; text: string };

const serviceLinks = [
  {
    label: "Learn about criminal defense investigations",
    href: "/services/investigations",
    className: "hotspot-investigations",
  },
  {
    label: "Learn about Ratchet Bail Bonds",
    href: "/services/bail-bonds",
    className: "hotspot-bail",
  },
  {
    label: "Learn about community association management",
    href: "/services/community-management",
    className: "hotspot-management",
  },
] as const;

export function HomeExperience() {
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Welcome to The Contorno Corporation. I can help you identify the right service and prepare a confidential callback request. How may I help?",
    },
  ]);
  const [chatBusy, setChatBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [panel]);

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Sending your confidential request…");
    const form = event.currentTarget;
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = (await response.json()) as { message?: string };
    setNotice(result.message ?? (response.ok ? "Request received." : "Please try again."));
    if (response.ok) form.reset();
  }

  async function submitSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Adding you to the update list…");
    const form = event.currentTarget;
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = (await response.json()) as { message?: string };
    setNotice(result.message ?? (response.ok ? "You’re subscribed." : "Please try again."));
    if (response.ok) form.reset();
  }

  async function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const message = input.value.trim();
    if (!message || chatBusy) return;
    const nextChat = [...chat, { role: "user" as const, text: message }];
    setChat(nextChat);
    setChatBusy(true);
    input.value = "";
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextChat.slice(-8) }),
      });
      const result = (await response.json()) as { reply?: string };
      setChat((current) => [
        ...current,
        { role: "assistant", text: result.reply ?? "Please use the case review form and our team will follow up." },
      ]);
    } catch {
      setChat((current) => [
        ...current,
        { role: "assistant", text: "I’m unable to respond right now. Please submit a confidential case review request." },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  function openPanel(next: Exclude<Panel, null>) {
    setNotice("");
    setPanel(next);
  }

  return (
    <div className="homepage">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="home-header">
        <PrimaryNavigation showBrand />
      </header>
      <main id="main-content" className="homepage-artwork" aria-label="The Contorno Corporation homepage">
        <div className="design-canvas">
        {/* The approved PDF raster is served byte-for-byte to preserve exact branding. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="homepage-design"
          src="/contorno-homepage.png"
          alt="The Contorno Corporation homepage design showing private investigations, Ratchet Bail Bonds, and community association management."
          width="1707"
          height="2560"
        />

        <button
          className="design-hotspot hotspot-contact"
          aria-label="Contact The Contorno Corporation"
          onClick={() => openPanel("assistant")}
        />
        <button
          className="design-hotspot hotspot-case"
          aria-label="Start your confidential case review"
          onClick={() => openPanel("lead")}
        />
        {serviceLinks.map((service) => (
          <Link
            key={service.href}
            className={`design-hotspot ${service.className}`}
            href={service.href}
            aria-label={service.label}
          />
        ))}
        <button
          className="design-hotspot hotspot-subscribe"
          aria-label="Subscribe for Contorno Corporation updates"
          onClick={() => openPanel("subscribe")}
        />
        <Link className="design-hotspot hotspot-privacy" href="/privacy" aria-label="Privacy policy" />
        <Link className="design-hotspot hotspot-terms" href="/terms" aria-label="Terms of service" />
        </div>

        <section className="sr-only" aria-label="Company overview">
        <h1>The Contorno Corporation</h1>
        <p>Excellence in investigation. Integrity in defense. Results that matter.</p>
        <h2>Private Investigations</h2>
        <p>Expert criminal defense case analysis and investigation services.</p>
        <h2>Ratchet Bail Bonds</h2>
        <p>Fast and reliable bail bond services. Coming soon.</p>
        <h2>Contorno Community Association Management</h2>
        <p>Management solutions for condominium communities.</p>
        </section>
      </main>

      {panel && (
        <div className="modal-backdrop">
          <div
            ref={dialogRef}
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            tabIndex={-1}
          >
            <button className="modal-close" onClick={() => setPanel(null)} aria-label="Close dialog">
              ×
            </button>
            {panel === "lead" && (
              <>
                <p className="eyebrow">Confidential intake</p>
                <h2 id="dialog-title">Start your case review</h2>
                <p className="modal-intro">Share only the information needed for our team to contact you. Do not send evidence or privileged documents through this form.</p>
                <div className="modal-attorney-route"><strong>Defense attorney or authorized legal staff?</strong><p>Use the structured case intake for conflict screening, deadlines, and investigative scope.</p><Link className="gold-button" href="/attorney-intake">Open attorney intake</Link></div>
                <LeadForm onSubmit={submitLead} />
              </>
            )}
            {panel === "assistant" && (
              <>
                <p className="eyebrow">Private, guided intake</p>
                <h2 id="dialog-title">Contorno AI Concierge</h2>
                <p className="modal-intro">General service guidance only. This assistant does not provide legal advice, bond approval, or emergency services.</p>
                <div className="chat-log" aria-live="polite">
                  {chat.map((message, index) => (
                    <p key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
                      <strong>{message.role === "assistant" ? "Concierge" : "You"}</strong>
                      {message.text}
                    </p>
                  ))}
                  {chatBusy && <p className="chat-thinking">Concierge is preparing a response…</p>}
                </div>
                <form className="chat-form" onSubmit={submitChat}>
                  <label className="sr-only" htmlFor="assistant-message">Ask the concierge</label>
                  <input id="assistant-message" name="message" placeholder="How can we help?" maxLength={800} autoComplete="off" required />
                  <button type="submit" disabled={chatBusy}>Send</button>
                </form>
                <button className="text-action" onClick={() => openPanel("lead")}>Request a confidential callback instead</button>
              </>
            )}
            {panel === "subscribe" && (
              <>
                <p className="eyebrow">Stay informed</p>
                <h2 id="dialog-title">Sign up for updates and news</h2>
                <form className="lead-form" onSubmit={submitSubscription}>
                  <label>First name<input name="firstName" maxLength={80} autoComplete="given-name" required /></label>
                  <label>Email<input name="email" type="email" maxLength={160} autoComplete="email" required /></label>
                  <button className="gold-button" type="submit">Subscribe</button>
                </form>
              </>
            )}
            {notice && <p className="form-notice" role="status">{notice}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="field-row">
        <label>First name<input name="firstName" maxLength={80} autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" maxLength={80} autoComplete="family-name" required /></label>
      </div>
      <div className="field-row">
        <label>Email<input name="email" type="email" maxLength={160} autoComplete="email" required /></label>
        <label>Phone<input name="phone" type="tel" maxLength={30} autoComplete="tel" required /></label>
      </div>
      <label>
        Service needed
        <select name="service" defaultValue="investigations" required>
          <option value="investigations">Private investigations / criminal defense analysis</option>
          <option value="bail-bonds">Ratchet Bail Bonds - coming soon</option>
          <option value="community-management">Community association management</option>
          <option value="general">General inquiry</option>
        </select>
      </label>
      <label>Brief description<textarea name="message" rows={4} maxLength={2000} required /></label>
      <label className="consent"><input name="consent" type="checkbox" value="yes" required /> I consent to be contacted about this request.</label>
      <button className="gold-button" type="submit">Submit confidential request</button>
    </form>
  );
}
