type PublicJsonResult =
  | { body: Record<string, unknown>; response?: never }
  | { body?: never; response: Response };

export async function readPublicJson(request: Request, maxBytes: number): Promise<PublicJsonResult> {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const origin = request.headers.get("origin");

  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { response: Response.json({ message: "This form must be submitted from the secure website." }, { status: 415 }) };
  }
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { response: Response.json({ message: "The submission is too large." }, { status: 413 }) };
  }
  if (origin && origin !== new URL(request.url).origin) {
    return { response: Response.json({ message: "This form must be submitted from the secure website." }, { status: 403 }) };
  }

  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { response: Response.json({ message: "The submission is too large." }, { status: 413 }) };
      }
      chunks.push(value);
    }
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid object");
    return { body: parsed as Record<string, unknown> };
  } catch {
    return { response: Response.json({ message: "The form submission could not be read." }, { status: 400 }) };
  }
}
