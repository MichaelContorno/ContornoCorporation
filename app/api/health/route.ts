import { assertAdminConfiguration } from "@/app/admin-auth";
import { ensureDatabase, validateRuntimeConfiguration, verifyDocumentsBucket } from "@/db/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    validateRuntimeConfiguration();
    assertAdminConfiguration();
    await ensureDatabase();
    await verifyDocumentsBucket();
    return Response.json({ status: "ok" }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json({ status: "unavailable" }, {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }
}
