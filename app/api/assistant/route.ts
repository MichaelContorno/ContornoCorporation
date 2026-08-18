import { cleanString, clientHash, ensureDatabase, runtimeEnv } from "@/db/runtime";

type IncomingMessage = { role?: unknown; text?: unknown };

const systemPrompt = `You are the website concierge for The Contorno Corporation. Route visitors among three services: (1) private investigations and criminal defense case analysis for defense counsel, (2) Ratchet Bail Bonds, which is coming soon and is not currently posting bonds, and (3) community association management for condominium communities. Be concise, respectful, and calm. Never provide legal advice, predict case outcomes, promise release, quote bond terms, or claim an emergency response. Do not request evidence, social security numbers, payment details, or privileged case documents. Encourage a confidential callback request when personal case details would be needed. For emergencies, tell the visitor to call 911 or the appropriate local authority.`;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: IncomingMessage[] };
    const messages = Array.isArray(body.messages)
      ? body.messages.slice(-8).map((item) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          content: cleanString(item.text, 800),
        })).filter((item) => item.content)
      : [];
    if (!messages.length) return Response.json({ reply: "How may I help you today?" });

    const DB = await ensureDatabase();
    const hash = await clientHash(request);
    const cutoff = Date.now() - 60 * 60 * 1000;
    const recent = await DB.prepare("SELECT COUNT(*) AS count FROM assistant_requests WHERE client_hash = ? AND created_at >= ?")
      .bind(hash, cutoff).first<{ count: number }>();
    if ((recent?.count ?? 0) >= 20) {
      return Response.json({ reply: "I’ve reached the conversation limit for this hour. Please submit a confidential callback request and the team will follow up." }, { status: 429 });
    }
    await DB.prepare("INSERT INTO assistant_requests (id, created_at, client_hash) VALUES (?, ?, ?)")
      .bind(crypto.randomUUID(), Date.now(), hash).run();

    const { OPENAI_API_KEY, OPENAI_MODEL } = runtimeEnv();
    if (!OPENAI_API_KEY) return Response.json({ reply: fallbackReply(messages.at(-1)?.content ?? "") });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: OPENAI_MODEL ?? "gpt-5.6-luna",
        instructions: systemPrompt,
        input: messages,
        max_output_tokens: 220,
      }),
    });
    if (!response.ok) return Response.json({ reply: fallbackReply(messages.at(-1)?.content ?? "") });
    const data = await response.json() as { output?: { content?: { type?: string; text?: string }[] }[] };
    const reply = data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    return Response.json({ reply: reply || fallbackReply(messages.at(-1)?.content ?? "") });
  } catch {
    return Response.json({ reply: "I’m unable to respond right now. Please submit a confidential callback request." }, { status: 500 });
  }
}

function fallbackReply(message: string) {
  const normalized = message.toLowerCase();
  if (/911|emergency|danger|threat|hurt/.test(normalized)) return "If anyone is in immediate danger, call 911 or the appropriate local authority. For a non-emergency service inquiry, you may submit a confidential callback request.";
  if (/bail|bond|jail|arrest|release/.test(normalized)) return "Ratchet Bail Bonds is coming soon and is not currently posting bonds through this website. You may join the update list or request a callback for launch information. No release or bond approval can be promised.";
  if (/hoa|condo|association|board|property|community/.test(normalized)) return "Contorno Community Association Management supports condominium communities with board coordination, resident communication, vendor oversight, and operational planning. Would you like to request an association consultation?";
  if (/investigat|defense|attorney|case|evidence|witness/.test(normalized)) return "Contorno Criminal Defense Strategies & Investigations supports defense counsel with case analysis, witness development, timeline work, and organized investigative reporting. Please avoid sharing evidence here; use the confidential callback form to discuss scope.";
  return "I can help with private investigations and criminal defense analysis, Ratchet Bail Bonds launch information, or community association management. Which service are you interested in?";
}
