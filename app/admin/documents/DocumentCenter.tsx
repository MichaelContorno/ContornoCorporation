"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminDocument = {
  id: string;
  createdAt: number;
  intakeId: string | null;
  displayName: string;
  originalName: string;
  sizeBytes: number;
  uploadedByEmail: string;
};

export type IntakeOption = { id: string; referenceCode: string; matterCaption: string };

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentCenter({ documents, intakes }: { documents: AdminDocument[]; intakes: IntakeOption[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = documents.find((document) => document.id === selectedId) ?? documents[0] ?? null;

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("Uploading and validating the PDF…");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "x-contorno-backoffice": "1" },
        body: new FormData(form),
      });
      const result = await response.json() as { message?: string; id?: string };
      setNotice(result.message ?? "The PDF could not be uploaded.");
      if (response.ok) {
        form.reset();
        if (result.id) setSelectedId(result.id);
        router.refresh();
      }
    } catch {
      setNotice("The PDF could not be uploaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(document: AdminDocument) {
    if (!window.confirm(`Remove “${document.displayName}” from the protected document center? This cannot be undone.`)) return;
    setBusy(true);
    setNotice("Removing the PDF…");
    try {
      const response = await fetch(`/api/admin/documents/${encodeURIComponent(document.id)}`, {
        method: "DELETE",
        headers: { "x-contorno-backoffice": "1" },
      });
      const result = await response.json() as { message?: string };
      setNotice(result.message ?? "The PDF could not be removed.");
      if (response.ok) {
        setSelectedId("");
        router.refresh();
      }
    } catch {
      setNotice("The PDF could not be removed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="document-center">
      <section className="document-upload-card" aria-labelledby="upload-heading">
        <div><p className="eyebrow">Private R2 storage</p><h2 id="upload-heading">Add a PDF</h2><p>PDF only, up to 15 MB. Files remain private and are delivered only through authenticated back-office routes.</p></div>
        <form className="lead-form" onSubmit={upload}>
          <label>Display name<input name="displayName" maxLength={160} placeholder="Example: Case chronology — revised" /></label>
          <label>Associate with attorney intake <span className="optional">Optional</span><select name="intakeId" defaultValue=""><option value="">No intake selected</option>{intakes.map((intake) => <option value={intake.id} key={intake.id}>{intake.referenceCode} — {intake.matterCaption}</option>)}</select></label>
          <label>PDF file<input name="file" type="file" accept="application/pdf,.pdf" required /></label>
          <button className="gold-button" type="submit" disabled={busy}>{busy ? "Working…" : "Upload protected PDF"}</button>
        </form>
      </section>
      <p className="form-notice" role="status">{notice}</p>
      <div className="document-workspace">
        <section className="document-library" aria-labelledby="library-heading">
          <h2 id="library-heading">Document library</h2>
          {documents.length === 0 ? <p className="empty-state">No PDFs have been uploaded yet.</p> : <div className="document-list">{documents.map((document) => (
            <button className={document.id === selected?.id ? "document-row selected" : "document-row"} type="button" key={document.id} onClick={() => setSelectedId(document.id)}>
              <strong>{document.displayName}</strong>
              <span>{fileSize(document.sizeBytes)} · {new Date(document.createdAt).toLocaleDateString("en-US")}</span>
              <small>{document.intakeId ? "Linked to attorney intake" : "Back-office document"}</small>
            </button>
          ))}</div>}
        </section>
        <section className="pdf-reader" aria-labelledby="reader-heading">
          <div className="pdf-reader-heading"><div><p className="eyebrow">Protected viewer</p><h2 id="reader-heading">{selected?.displayName ?? "Select a PDF"}</h2></div>{selected && <div className="pdf-actions"><a href={`/api/admin/documents/${selected.id}`} target="_blank" rel="noreferrer">Open</a><a href={`/api/admin/documents/${selected.id}?download=1`}>Download</a><button type="button" onClick={() => remove(selected)} disabled={busy}>Remove</button></div>}</div>
          {selected ? <object key={selected.id} className="pdf-object" data={`/api/admin/documents/${selected.id}`} type="application/pdf"><div className="pdf-fallback"><p>This browser cannot display the PDF inline.</p><a className="gold-button inline-button" href={`/api/admin/documents/${selected.id}?download=1`}>Download PDF</a></div></object> : <div className="pdf-empty"><p>Choose a document from the library to read it here.</p></div>}
        </section>
      </div>
    </div>
  );
}
