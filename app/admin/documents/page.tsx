import Link from "next/link";
import { BrandShell } from "@/app/_components/BrandShell";
import { adminLogoutPath, requireAdminUser } from "@/app/admin-auth";
import { ensureDatabase } from "@/db/runtime";
import { DocumentCenter, type AdminDocument, type IntakeOption } from "./DocumentCenter";

export const dynamic = "force-dynamic";

type DocumentRow = {
  id: string;
  created_at: number;
  intake_id: string | null;
  display_name: string;
  original_name: string;
  size_bytes: number;
  uploaded_by_email: string;
};

type IntakeRow = { id: string; reference_code: string; matter_caption: string };

export default async function DocumentsPage() {
  const user = await requireAdminUser("/admin/documents");
  const DB = await ensureDatabase();
  const [documentRows, intakeRows] = await Promise.all([
    DB.prepare(`SELECT id, created_at, intake_id, display_name, original_name, size_bytes, uploaded_by_email
      FROM documents WHERE status = 'ready' ORDER BY created_at DESC LIMIT 200`).all<DocumentRow>(),
    DB.prepare("SELECT id, reference_code, matter_caption FROM attorney_intakes ORDER BY created_at DESC LIMIT 200").all<IntakeRow>(),
  ]);
  const documents: AdminDocument[] = documentRows.results.map((document) => ({
    id: document.id,
    createdAt: document.created_at,
    intakeId: document.intake_id,
    displayName: document.display_name,
    originalName: document.original_name,
    sizeBytes: document.size_bytes,
    uploadedByEmail: document.uploaded_by_email,
  }));
  const intakes: IntakeOption[] = intakeRows.results.map((intake) => ({ id: intake.id, referenceCode: intake.reference_code, matterCaption: intake.matter_caption }));

  return <BrandShell><main className="admin-page"><div className="content-wrap">
    <div className="admin-heading"><div><p className="eyebrow">Secure administration</p><h1>PDF document center</h1><p>Signed in as {user.email}</p></div><div className="admin-heading-actions"><Link href="/admin">Back to dashboard</Link><a href={adminLogoutPath("/")}>Sign out</a></div></div>
    <DocumentCenter documents={documents} intakes={intakes} />
  </div></main></BrandShell>;
}
