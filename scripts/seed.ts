import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import sujets from "../resources/sujets.json";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const themeIcons: Record<string, string> = {
  "SI et environnement": "Leaf",
  "Cybersecurité": "Shield",
  "Cloud et virtualisation": "Cloud",
  "Big Data": "Database",
  "Développement": "Code",
  "Mobilité": "Smartphone",
  "Management et stratégie": "Briefcase",
  "Blockchain": "Link",
  "Intelligence artificielle": "Brain",
  "Optimisation du SI": "Settings",
};

async function main() {
  console.log("Seeding database...");

  // Get unique themes
  const themeNames = [...new Set(sujets.map((s) => s.theme))];

  // Upsert themes
  for (const name of themeNames) {
    await prisma.theme.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: slugify(name),
        icon: themeIcons[name] ?? "Settings",
      },
    });
  }

  const themes = await prisma.theme.findMany();
  const themeMap = new Map(themes.map((t) => [t.name, t.id]));

  // Upsert subjects
  for (const s of sujets) {
    const themeId = themeMap.get(s.theme)!;
    const existing = await prisma.subject.findFirst({
      where: { sujet: s.sujet, themeId },
    });
    if (!existing) {
      await prisma.subject.create({
        data: {
          type: s.type,
          domaine: s.domaine,
          sujet: s.sujet,
          themeId,
        },
      });
    }
  }

  // Seed news from cache if available
  const cacheDir = join(import.meta.dir, "..", "resources", "news-cache");
  try {
    const files = readdirSync(cacheDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const data = JSON.parse(readFileSync(join(cacheDir, file), "utf-8"));
      for (const article of data.articles) {
        const themeId = themeMap.get(article.theme);
        if (!themeId) continue;

        await prisma.newsArticle.upsert({
          where: { url_themeId: { url: article.url, themeId } },
          update: {
            title: article.title,
            description: article.description,
            source: article.source,
            publishedAt: new Date(article.publishedAt),
          },
          create: {
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source,
            publishedAt: new Date(article.publishedAt),
            themeId,
          },
        });
      }
    }
    console.log("News articles seeded from cache.");
  } catch {
    console.log("No news cache found, skipping news seed.");
  }

  const subjectCount = await prisma.subject.count();
  const articleCount = await prisma.newsArticle.count();
  console.log(`Done! ${themes.length} themes, ${subjectCount} subjects, ${articleCount} articles.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
