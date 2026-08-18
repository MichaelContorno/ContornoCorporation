import { authorizeAdminApi } from "@/app/admin-access";
import { intakeStatuses } from "@/app/_lib/attorney-intake";
import { cleanString, ensureDatabase } from "@/db/runtime";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdminApi(request, true);
  if (auth.error) return auth.error;
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const status = cleanString(body.status, 30);
    if (!intakeStatuses.has(status)) return Response.json({ message: "Choose a valid intake status." }, { status: 400 });
    const DB = await ensureDatabase();
    const result = await DB.prepare("UPDATE attorney_intakes SET status = ?, updated_at = ? WHERE id = ?")
      .bind(status, Date.now(), id).run();
    if (!result.meta.changes) return Response.json({ message: "The intake could not be found." }, { status: 404 });
    return Response.json({ message: "Intake status updated.", status });
  } catch {
    return Response.json({ message: "The intake status could not be updated." }, { status: 500 });
  }
}
