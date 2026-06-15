// Génère un fichier SQL d'import des résumés IA (.md) vers la table AiSummary.
//
// Chaque résumé est un fichier markdown dans resources/summaries/<theme>/<id>-<slug>.md
// avec un front matter YAML minimal :
//   ---
//   id: 4569
//   provider: anthropic
//   model: claude-opus-4-8
//   ...
//   ---
//   <corps markdown du résumé>
//
// Le SQL produit upserte dans AiSummary en respectant la clé de cache de l'app :
//   model = `${model}::${length}::${PROMPT_VERSION}`
//
// Usage :
//   bun run scripts/build-summaries-sql.ts > /tmp/import-summaries.sql
//   docker exec -i grand-oral-db psql -U grandoral -d grandoral -v ON_ERROR_STOP=1 < /tmp/import-summaries.sql

import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const SUMMARIES_DIR = join(import.meta.dir, "..", "resources", "summaries");
const LENGTH = "medium";
const PROMPT_VERSION = "v2-problematique"; // doit rester synchro avec src/app/api/ai/summarize/route.ts
const DOLLAR_TAG = "$SUM$";

interface ParsedSummary {
  id: number;
  provider: string;
  model: string;
  content: string;
  file: string;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function parse(file: string): ParsedSummary | null {
  const raw = readFileSync(file, "utf-8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  // Fichiers .md sans front matter (ex. GUIDE-GENERATION-RESUMES.md) : ignorés.
  if (!match) return null;

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }

  const content = match[2].trim();
  const id = Number(meta.id);
  if (!Number.isInteger(id)) throw new Error(`id invalide dans ${file}`);
  if (!meta.provider || !meta.model) throw new Error(`provider/model manquant dans ${file}`);
  if (!content) throw new Error(`corps vide dans ${file}`);
  if (content.includes(DOLLAR_TAG)) throw new Error(`Le tag ${DOLLAR_TAG} apparaît dans ${file}`);

  return { id, provider: meta.provider, model: meta.model, content, file };
}

const files = walk(SUMMARIES_DIR);
const summaries = files
  .map(parse)
  .filter((s): s is ParsedSummary => s !== null);

const lines: string[] = [];
lines.push("BEGIN;");
for (const s of summaries) {
  const cacheModel = `${s.model}::${LENGTH}::${PROMPT_VERSION}`;
  lines.push(
    `INSERT INTO "AiSummary" ("articleId", "provider", "model", "content", "createdAt")\n` +
      `VALUES (${s.id}, '${s.provider}', '${cacheModel}', ${DOLLAR_TAG}${s.content}${DOLLAR_TAG}, now())\n` +
      `ON CONFLICT ("articleId", "provider", "model") DO UPDATE SET content = EXCLUDED.content;`
  );
}
lines.push("COMMIT;");

console.log(lines.join("\n\n"));
console.error(`${summaries.length} résumés prêts à importer.`);
