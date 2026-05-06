type SummaryStreamEvent =
  | { type: "start" | "ping" | "done" }
  | { type: "chunk"; content?: string }
  | { type: "error"; error?: string };

function parseEvent(line: string): SummaryStreamEvent {
  try {
    return JSON.parse(line) as SummaryStreamEvent;
  } catch {
    throw new Error("Réponse de streaming invalide");
  }
}

async function readErrorResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return data?.error || "Erreur de génération";
  }

  return (await res.text()).slice(0, 120) || "Erreur de génération";
}

export async function streamAISummary(
  payload: Record<string, unknown>,
  onText: (text: string) => void,
) {
  const res = await fetch("/api/ai/summarize/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readErrorResponse(res));
  if (!res.body) throw new Error("Le navigateur ne supporte pas le streaming");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  function handleLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return;

    const event = parseEvent(trimmed);
    if (event.type === "error") throw new Error(event.error || "Erreur de génération");
    if (event.type === "chunk" && event.content) {
      text += event.content;
      onText(text);
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) handleLine(line);
  }

  buffer += decoder.decode();
  if (buffer.trim()) handleLine(buffer);

  return text;
}
