import { authorizeAdminApi } from "@/app/admin-access";
import { ADMIN_PDF_LIMIT, safePdfFilename, sha256Hex, validatePdf } from "@/app/_lib/pdf-documents";
import { cleanString, documentsBucket, ensureDatabase } from "@/db/runtime";

const MAX_UPLOAD_REQUEST = ADMIN_PDF_LIMIT + 512 * 1024;

export async function GET(request: Request) {
  const auth = await authorizeAdminApi(request);
  if (auth.error) return auth.error;
  const DB = await ensureDatabase();
  const documents = await DB.prepare(`SELECT id, created_at, updated_at, status, intake_id, source,
    uploaded_by_email, display_name, original_name, content_type, size_bytes
    FROM documents WHERE status = 'ready' ORDER BY created_at DESC LIMIT 200`).all();
  return Response.json({ documents: documents.results }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: Request) {
  const auth = await authorizeAdminApi(request, true);
  if (auth.error || !auth.user) return auth.error;
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_UPLOAD_REQUEST) {
      return Response.json({ message: "The upload must be 15 MB or smaller." }, { status: 413 });
    }
    const data = await request.formData();
    const validation = await validatePdf(data.get("file"), ADMIN_PDF_LIMIT);
    if (validation.error || !validation.file) {
      return Response.json({ message: validation.error ?? "Choose a PDF to upload." }, { status: 400 });
    }
    const file = validation.file;
    const displayName = cleanString(data.get("displayName"), 160) || safePdfFilename(file.name).replace(/\.pdf$/i, "");
    const intakeId = cleanString(data.get("intakeId"), 80) || null;
    const DB = await ensureDatabase();
    if (intakeId) {
      const intake = await DB.prepare("SELECT id FROM attorney_intakes WHERE id = ?").bind(intakeId).first();
      if (!intake) return Response.json({ message: "The selected attorney intake no longer exists." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    const date = new Date(now);
    const storageKey = `documents/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${id}.pdf`;
    const originalName = safePdfFilename(file.name);
    const sha256 = await sha256Hex(file);
    const bucket = documentsBucket();
    await bucket.put(storageKey, file.stream(), {
      httpMetadata: { contentType: "application/pdf" },
      customMetadata: { documentId: id },
    });
    try {
      await DB.batch([
        DB.prepare(`INSERT INTO documents (
          id, created_at, updated_at, status, intake_id, source,
          uploaded_by_user_id, uploaded_by_email, display_name, storage_key,
          original_name, content_type, size_bytes, sha256
        ) VALUES (?, ?, ?, 'ready', ?, 'admin', ?, ?, ?, ?, ?, 'application/pdf', ?, ?)`)
          .bind(id, now, now, intakeId, auth.user.userId, auth.user.email, displayName, storageKey, originalName, file.size, sha256),
        DB.prepare(`INSERT INTO document_audit_events
          (id, created_at, document_id, actor_user_id, actor_email, action)
          VALUES (?, ?, ?, ?, ?, 'upload')`)
          .bind(crypto.randomUUID(), now, id, auth.user.userId, auth.user.email),
      ]);
    } catch (error) {
      await bucket.delete(storageKey);
      throw error;
    }
    return Response.json({ message: "The PDF was added to the protected document center.", id }, { status: 201 });
  } catch {
    return Response.json({ message: "The PDF could not be uploaded. Please try again." }, { status: 500 });
  }
}
