import { cleanString, ensureDatabase, validEmail } from "@/db/runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const firstName = cleanString(body.firstName, 80);
    const email = cleanString(body.email, 160).toLowerCase();
    if (!firstName || !validEmail(email)) {
      return Response.json({ message: "Please enter your first name and a valid email address." }, { status: 400 });
    }
    const DB = await ensureDatabase();
    await DB.prepare(`INSERT INTO subscribers (id, created_at, first_name, email, active)
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(email) DO UPDATE SET first_name = excluded.first_name, active = 1`)
      .bind(crypto.randomUUID(), Date.now(), firstName, email).run();
    return Response.json({ message: "Thank you. You are subscribed for Contorno Corporation updates." });
  } catch {
    return Response.json({ message: "We could not complete your subscription right now." }, { status: 500 });
  }
}
