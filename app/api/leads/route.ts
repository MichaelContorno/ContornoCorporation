import { cleanString, clientHash, ensureDatabase, validEmail } from "@/db/runtime";

const allowedServices = new Set(["investigations", "bail-bonds", "community-management", "general"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const firstName = cleanString(body.firstName, 80);
    const lastName = cleanString(body.lastName, 80);
    const email = cleanString(body.email, 160).toLowerCase();
    const phone = cleanString(body.phone, 30);
    const service = cleanString(body.service, 40);
    const message = cleanString(body.message, 2000);
    const consent = cleanString(body.consent, 8);

    if (!firstName || !lastName || !validEmail(email) || !phone || !message || !allowedServices.has(service) || consent !== "yes") {
      return Response.json({ message: "Please complete every required field with valid information." }, { status: 400 });
    }

    const DB = await ensureDatabase();
    const hash = await clientHash(request);
    const cutoff = Date.now() - 60 * 60 * 1000;
    const recent = await DB.prepare("SELECT COUNT(*) AS count FROM leads WHERE client_hash = ? AND created_at >= ?")
      .bind(hash, cutoff).first<{ count: number }>();
    if ((recent?.count ?? 0) >= 5) {
      return Response.json({ message: "We have received your recent requests. Please allow our team time to respond." }, { status: 429 });
    }

    const now = Date.now();
    await DB.prepare(`INSERT INTO leads
      (id, created_at, updated_at, status, first_name, last_name, email, phone, service, message, source, client_hash)
      VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, 'website', ?)`)
      .bind(crypto.randomUUID(), now, now, firstName, lastName, email, phone, service, message, hash).run();

    return Response.json({ message: "Your confidential request has been received. A member of the team will follow up using the contact information provided." });
  } catch {
    return Response.json({ message: "We could not submit your request right now. Please try again shortly." }, { status: 500 });
  }
}
