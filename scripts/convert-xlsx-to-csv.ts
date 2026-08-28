import * as XLSX from "xlsx";
import { join } from "path";
import { mkdirSync } from "fs";

const RESOURCES_DIR = join(import.meta.dir, "..", "resources");
const INPUT_FILE = join(
  RESOURCES_DIR,
  "Thèmes et sujets grand oral tout domaine_INFO_BLANC_v09.01.2025.xlsx"
);
const OUTPUT_DIR = RESOURCES_DIR;

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

const workbook = XLSX.readFile(INPUT_FILE);
const sheet = workbook.Sheets["Liste"];
const rawData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

function cellText(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

// Parse and structure data
const subjects: {
  type: string;
  domaine: string;
  theme: string;
  sujet: string;
}[] = [];

for (let i = 1; i < rawData.length; i++) {
  const row = rawData[i];
  if (!row[0] || !row[6]) continue;

  subjects.push({
    type: cellText(row[0]),
    domaine: cellText(row[2]),
    theme: cellText(row[4]),
    sujet: cellText(row[6]),
  });
}

// Write CSV
const csvHeader = "type,domaine,theme,sujet";
const csvRows = subjects.map(
  (s) =>
    `"${s.type}","${s.domaine}","${s.theme}","${s.sujet.replace(/"/g, '""')}"`
);
const csvContent = [csvHeader, ...csvRows].join("\n");

await Bun.write(join(OUTPUT_DIR, "sujets.csv"), csvContent);

// Write JSON (more practical for the web app)
await Bun.write(
  join(OUTPUT_DIR, "sujets.json"),
  JSON.stringify(subjects, null, 2)
);

// Write a summary by theme
const byTheme: Record<string, string[]> = {};
for (const s of subjects) {
  if (!byTheme[s.theme]) byTheme[s.theme] = [];
  byTheme[s.theme].push(s.sujet);
}

await Bun.write(
  join(OUTPUT_DIR, "themes.json"),
  JSON.stringify(byTheme, null, 2)
);

console.log(`Converted ${subjects.length} subjects`);
console.log(`Themes: ${Object.keys(byTheme).join(", ")}`);
console.log(`Output: ${OUTPUT_DIR}/sujets.csv, sujets.json, themes.json`);
