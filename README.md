# Grand Oral Aggregator

Plateforme de préparation au Grand Oral (Master informatique) : thèmes, sujets, actualités scrapées par thème, résumés IA, chat et commentaires en temps réel. Interface "OS-like" avec gestionnaire de fenêtres draggables.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Bun** (runtime + bundler)
- **Postgres 17** + **Prisma 7** (avec adapter `@prisma/adapter-pg`)
- **Better Auth** + Discord OAuth
- **Tailwind 4** + **shadcn/ui** + **Radix UI** + **Framer Motion**
- **Server-Sent Events** pour le chat / commentaires temps réel
- **react-markdown** + Web Speech API (TTS) pour les résumés

## Fonctionnalités principales

- 10 thèmes × ~6 sujets de référence + sujets ajoutés par les utilisateurs (publics ou privés)
- Agrégateur d'actualités par thème (Bing News RSS ou NewsAPI)
- Scraping article via Readability/linkedom
- Résumés IA via OpenAI / Anthropic / Gemini / Mistral / Ollama (clé fournie côté client, jamais stockée serveur)
- Cache persistant des résumés en base (`AiSummary`)
- Chat global + commentaires par thème, avec mentions, édition, suppression et historique
- Deux modes d'affichage : "OS desktop" avec fenêtres iframe ou layout site classique
- Système de rôles : `user` / `admin` (en DB) / `superadmin` (dérivé d'`SUPER_ADMIN_DISCORD_IDS`, jamais stocké)

## Démarrage local

```sh
# 1. Postgres en local
docker compose up -d postgres

# 2. Dépendances + génération du client Prisma
bun install
bunx prisma generate
bunx prisma migrate dev

# 3. Seed initial (thèmes + sujets)
bun run scripts/seed.ts

# 4. (optionnel) Récupérer une première vague d'articles
bun run scripts/fetch-news.ts

# 5. Dev server
bun dev
```

Variables d'environnement attendues dans `.env` (cf. `docs/DEPLOYMENT.md` §1 pour les valeurs prod) :

```env
DATABASE_URL=postgresql://grandoral:grandoral@localhost:5432/grandoral?schema=public
BETTER_AUTH_SECRET=<32+ bytes hex>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
SUPER_ADMIN_DISCORD_IDS=<ton id discord>
CRON_SECRET=<32+ bytes hex>
# NEWS_API_KEY=  # optionnel — bascule sur NewsAPI au lieu de Bing News RSS
```

## Scripts

| Script | Rôle |
| --- | --- |
| `scripts/convert-xlsx-to-csv.ts` | Convertit le fichier Excel des sujets en JSON (one-shot) |
| `scripts/seed.ts` | Peuple la DB : thèmes, sujets, articles depuis `resources/news-cache/` |
| `scripts/fetch-news.ts` | Scrape les actualités Bing News pour les 10 thèmes et upsert en DB |

## Routes API

- `GET/POST /api/auth/[...all]` — Better Auth (Discord OAuth)
- `GET/POST/PATCH/DELETE /api/chat` + `GET /api/chat/stream` (SSE)
- `GET/POST/PATCH/DELETE /api/comments` + `GET /api/comments/stream`
- `GET /api/news`, `GET /api/news/[slug]`, `POST /api/news/[slug]/scrape` (auth)
- `GET/POST /api/ai/summarize` (POST = auth)
- `GET/POST/PATCH/DELETE /api/subjects`
- `GET/PATCH /api/user/preferences`
- `GET /api/user/role`
- `GET /api/cron?secret=…` (auth via `CRON_SECRET`, lance `scripts/fetch-news.ts` détaché)

## Déploiement

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — `Dockerfile` multi-stage + `docker-compose.yml` (Postgres réseau interne, app derrière reverse proxy avec TLS), instructions cron 24h via `docker exec` ou HTTP, et procédure de mise à jour.

## Documentation

- [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) — spec d'origine du projet
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — guide de déploiement Docker + cron + reverse proxy
