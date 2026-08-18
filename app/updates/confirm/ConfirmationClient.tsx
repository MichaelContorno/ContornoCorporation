"use client";

import { useState, useSyncExternalStore } from "react";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/u;

function subscribeToFragment(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function currentFragment() {
  return window.location.hash;
}

export function ConfirmationClient() {
  const fragmentValue = useSyncExternalStore(subscribeToFragment, currentFragment, () => "");
  const token = new URLSearchParams(fragmentValue.slice(1)).get("token")?.trim() ?? "";
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [notice, setNotice] = useState("");
  const validToken = TOKEN_PATTERN.test(token);
  const statusMessage = notice || (validToken
    ? "Confirmation is waiting for your approval. Nothing happens until you select the button."
    : "This confirmation link is incomplete or invalid.");

  async function confirmSubscription() {
    if (!validToken || busy || complete) return;
    setBusy(true);
    setNotice("Confirming your email address…");
    try {
      const response = await fetch("/api/subscribe/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json() as { message?: string };
      setComplete(response.ok);
      setNotice(result.message ?? "We could not confirm your subscription.");
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        window.history.replaceState({}, "", "/updates/confirm");
      }
    } catch {
      setNotice("We could not confirm your subscription right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="privacy-note">
      <h2>Confirm this request</h2>
      <p>Select the button below only if you requested email updates from The Contorno Corporation.</p>
      {validToken && !complete && (
        <button className="gold-button inline-button" type="button" disabled={busy} onClick={confirmSubscription}>
          {busy ? "Confirming…" : "Confirm my email"}
        </button>
      )}
      <p className="form-notice" role="status" aria-live="polite">{statusMessage}</p>
    </div>
  );
}
