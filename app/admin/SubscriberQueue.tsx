"use client";

import { useMemo, useState } from "react";

export type AdminSubscriber = {
  id: string;
  createdAt: number;
  updatedAt: number;
  firstName: string;
  email: string;
  active: boolean;
  status: "pending" | "active" | "unsubscribed";
  consentedAt: number;
  verifiedAt: number | null;
  verificationMethod: string | null;
  unsubscribedAt: number | null;
};

type SubscriberActionResult = {
  message?: string;
  confirmationUrl?: string;
  updatedAt?: number;
};

const statusOrder = ["pending", "active", "unsubscribed"] as const;
const statusLabels = {
  pending: "Pending confirmation",
  active: "Active subscribers",
  unsubscribed: "Unsubscribed",
} as const;

export function SubscriberQueue({ initialSubscribers }: { initialSubscribers: AdminSubscriber[] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [issuedLinks, setIssuedLinks] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState("");
  const [notice, setNotice] = useState("");
  const grouped = useMemo(() => Object.fromEntries(statusOrder.map((status) => [
    status,
    subscribers.filter((subscriber) => subscriber.status === status),
  ])) as Record<(typeof statusOrder)[number], AdminSubscriber[]>, [subscribers]);

  async function runAction(subscriber: AdminSubscriber, action: "issue-confirmation" | "unsubscribe") {
    const operationKey = `${subscriber.id}:${action}`;
    setBusyKey(operationKey);
    setNotice(action === "issue-confirmation" ? "Issuing a protected confirmation link…" : "Unsubscribing the email address…");
    try {
      const response = await fetch(`/api/admin/subscribers/${encodeURIComponent(subscriber.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-contorno-backoffice": "1" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json() as SubscriberActionResult;
      if (response.ok && action === "issue-confirmation" && result.confirmationUrl) {
        setIssuedLinks((current) => ({ ...current, [subscriber.id]: result.confirmationUrl! }));
        try {
          await navigator.clipboard.writeText(result.confirmationUrl);
          setNotice("The confirmation link was issued and copied. It expires in 24 hours.");
        } catch {
          setNotice("The confirmation link was issued. Use the Copy link button or select the displayed link.");
        }
      } else if (response.ok && action === "unsubscribe") {
        setSubscribers((current) => current.map((item) => item.id === subscriber.id ? {
          ...item,
          active: false,
          status: "unsubscribed",
          updatedAt: result.updatedAt ?? Date.now(),
          unsubscribedAt: result.updatedAt ?? Date.now(),
        } : item));
        setIssuedLinks((current) => {
          const next = { ...current };
          delete next[subscriber.id];
          return next;
        });
        setNotice(result.message ?? "The email address was unsubscribed.");
      } else {
        setNotice(result.message ?? "The subscriber could not be updated.");
      }
    } catch {
      setNotice("The subscriber could not be updated. Please try again.");
    } finally {
      setBusyKey("");
    }
  }

  async function copyLink(subscriber: AdminSubscriber) {
    const link = issuedLinks[subscriber.id];
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setNotice(`The confirmation link for ${subscriber.email} was copied.`);
    } catch {
      setNotice("Select the displayed confirmation link and copy it manually.");
    }
  }

  if (subscribers.length === 0) return <p className="empty-state">No update requests have been submitted yet.</p>;

  return (
    <div className="subscriber-admin-list">
      <p className="form-notice compact-notice" role="status" aria-live="polite">{notice}</p>
      {statusOrder.map((status) => (
        <section className="admin-narrative" key={status} aria-labelledby={`subscriber-${status}-heading`}>
          <h3 id={`subscriber-${status}-heading`}>{statusLabels[status]} ({grouped[status].length})</h3>
          {grouped[status].length === 0 ? <p>None.</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name and email</th><th>Requested</th><th>Verified</th><th>Actions</th></tr></thead>
                <tbody>{grouped[status].map((subscriber) => {
                  const issueBusy = busyKey === `${subscriber.id}:issue-confirmation`;
                  const unsubscribeBusy = busyKey === `${subscriber.id}:unsubscribe`;
                  const link = issuedLinks[subscriber.id];
                  return (
                    <tr key={subscriber.id}>
                      <td><strong>{subscriber.firstName}</strong><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a><span className={`lead-status ${subscriber.status}`}>{subscriber.status}</span></td>
                      <td>{new Date(subscriber.consentedAt || subscriber.createdAt).toLocaleString("en-US")}</td>
                      <td>{subscriber.verifiedAt ? <>{new Date(subscriber.verifiedAt).toLocaleString("en-US")}<br /><small>{subscriber.verificationMethod ?? "Verified"}</small></> : "Not verified"}</td>
                      <td>
                        <div className="pdf-actions">
                          {subscriber.status === "pending" && (
                            <button type="button" disabled={Boolean(busyKey)} onClick={() => runAction(subscriber, "issue-confirmation")}>
                              {issueBusy ? "Issuing…" : "Issue confirmation link"}
                            </button>
                          )}
                          {subscriber.status !== "unsubscribed" && (
                            <button type="button" disabled={Boolean(busyKey)} onClick={() => runAction(subscriber, "unsubscribe")} aria-label={`Unsubscribe ${subscriber.email}`}>
                              {unsubscribeBusy ? "Unsubscribing…" : "Unsubscribe"}
                            </button>
                          )}
                        </div>
                        {link && (
                          <div className="lead-form">
                            <label htmlFor={`confirmation-link-${subscriber.id}`}>Confirmation link</label>
                            <input id={`confirmation-link-${subscriber.id}`} value={link} readOnly onFocus={(event) => event.currentTarget.select()} />
                            <div className="pdf-actions"><button type="button" onClick={() => copyLink(subscriber)} aria-label={`Copy confirmation link for ${subscriber.email}`}>Copy link</button></div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
