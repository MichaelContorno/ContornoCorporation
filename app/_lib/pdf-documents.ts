export const ADMIN_PDF_LIMIT = 15 * 1024 * 1024;

export function safePdfFilename(value: string) {
  const normalized = value.normalize("NFKC").replace(/[^a-zA-Z0-9._ ()-]/g, "_");
  const trimmed = normalized.replace(/^\.+/, "").slice(0, 180);
  return trimmed || "document.pdf";
}

export async function validatePdf(value: FormDataEntryValue | null, maxBytes: number) {
  if (!(value instanceof File) || value.size === 0) return { file: null as File | null };
  if (value.size > maxBytes) return { error: `The PDF must be ${Math.floor(maxBytes / 1024 / 1024)} MB or smaller.` };
  if (value.type !== "application/pdf" || !value.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are accepted." };
  }
  const signature = new TextDecoder("ascii").decode(await value.slice(0, 5).arrayBuffer());
  if (signature !== "%PDF-") return { error: "The selected file is not a valid PDF." };
  return { file: value };
}

export function inlinePdfDisposition(filename: string) {
  const safe = safePdfFilename(filename).replace(/["\\]/g, "_");
  return `inline; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(safe)}`;
}

export function attachmentPdfDisposition(filename: string) {
  return inlinePdfDisposition(filename).replace(/^inline/, "attachment");
}

export async function sha256Hex(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}
