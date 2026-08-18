import { authorizeAdminApi } from "@/app/admin-access";
import { attachmentPdfDisposition, inlinePdfDisposition } from "@/app/_lib/pdf-documents";
import { documentsBucket, ensureDatabase } from "@/db/runtime";

type Context = { params: Promise<{ id: string }> };

type DocumentRow = {
  id: string;
  status: string;
  storage_key: string;
  original_name: string;
  size_bytes: number;
};

function parseRangeHeader(value: string, size: number) {
  if (value.includes(",")) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    const length = Math.min(suffix, size);
    return { start: size - length, length };
  }
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start < 0 || start >= size || requestedEnd < start) return null;
  const end = Math.min(requestedEnd, size - 1);
  return { start, length: end - start + 1 };
}

export async function GET(request: Request, context: Context) {
  const auth = await authorizeAdminApi(request);
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const DB = await ensureDatabase();
  const document = await DB.prepare(`SELECT id, status, storage_key, original_name, size_bytes
    FROM documents WHERE id = ?`).bind(id).first<DocumentRow>();
  if (!document || document.status !== "ready") return new Response("Document not found", { status: 404 });

  const range = request.headers.get("range");
  const parsedRange = range ? parseRangeHeader(range, document.size_bytes) : null;
  if (range && !parsedRange) {
    return new Response("Invalid range", { status: 416, headers: { "content-range": `bytes */${document.size_bytes}` } });
  }
  const bucket = documentsBucket();
  const object = await bucket.get(document.storage_key, parsedRange ? { range: { offset: parsedRange.start, length: parsedRange.length } } : undefined);
  if (!object) return new Response("Document not found", { status: 404 });

  const download = new URL(request.url).searchParams.get("download") === "1";
  const now = Date.now();
  await DB.prepare(`INSERT INTO document_audit_events
    (id, created_at, document_id, actor_user_id, actor_email, action)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), now, document.id, auth.user.userId, auth.user.email, download ? "download" : "view").run();

  const headers = new Headers({
    "content-type": "application/pdf",
    "content-disposition": download ? attachmentPdfDisposition(document.original_name) : inlinePdfDisposition(document.original_name),
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
    "cross-origin-resource-policy": "same-origin",
    "accept-ranges": "bytes",
  });
  if (parsedRange) {
    const end = parsedRange.start + parsedRange.length - 1;
    headers.set("content-range", `bytes ${parsedRange.start}-${end}/${document.size_bytes}`);
    headers.set("content-length", String(parsedRange.length));
    return new Response(object.body, { status: 206, headers });
  } else {
    headers.set("content-length", String(document.size_bytes));
    return new Response(object.body, { status: 200, headers });
  }
}

export async function DELETE(request: Request, context: Context) {
  const auth = await authorizeAdminApi(request, true);
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const DB = await ensureDatabase();
  const document = await DB.prepare(`SELECT id, status, storage_key, original_name, size_bytes
    FROM documents WHERE id = ?`).bind(id).first<DocumentRow>();
  if (!document) return Response.json({ message: "The document is already removed." });

  await DB.prepare("UPDATE documents SET status = 'deleting', updated_at = ? WHERE id = ?").bind(Date.now(), id).run();
  try {
    await documentsBucket().delete(document.storage_key);
    const now = Date.now();
    await DB.batch([
      DB.prepare("DELETE FROM documents WHERE id = ?").bind(id),
      DB.prepare(`INSERT INTO document_audit_events
        (id, created_at, document_id, actor_user_id, actor_email, action)
        VALUES (?, ?, ?, ?, ?, 'delete')`)
        .bind(crypto.randomUUID(), now, id, auth.user.userId, auth.user.email),
    ]);
    return Response.json({ message: "The PDF was removed from the document center." });
  } catch {
    await DB.prepare("UPDATE documents SET status = 'ready', updated_at = ? WHERE id = ?").bind(Date.now(), id).run();
    return Response.json({ message: "The PDF could not be removed. Please try again." }, { status: 500 });
  }
}
