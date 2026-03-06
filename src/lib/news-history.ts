export interface NewsHistoryEntry {
  slug: string;
  title: string;
  source: string;
  theme: string;
  favicon?: string;
  visitedAt: string;
}

export async function getHistory(): Promise<NewsHistoryEntry[]> {
  try {
    const res = await fetch("/api/news/history");
    const data = await res.json();
    return data.history ?? [];
  } catch {
    return [];
  }
}

export async function addToHistory(slug: string): Promise<void> {
  try {
    await fetch("/api/news/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
  } catch {
    // Silently fail
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await fetch("/api/news/history", { method: "DELETE" });
  } catch {
    // Silently fail
  }
}
