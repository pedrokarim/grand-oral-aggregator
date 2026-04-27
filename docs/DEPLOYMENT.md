# Déploiement (Docker)

Le repo embarque un `Dockerfile` (Next.js standalone, Bun) et un `docker-compose.yml` (Postgres + web). Postgres n'expose **pas** de port à l'extérieur du réseau Docker. Le service web bind sur `127.0.0.1:3000` — il est attendu derrière un reverse proxy (Caddy / nginx / Traefik) qui termine TLS.

## 1. Préparer les secrets

Sur le serveur, dans le dossier du projet, créer un fichier `.env` à côté du `docker-compose.yml`. Générer des secrets aléatoires :

```sh
echo "BETTER_AUTH_SECRET=$(openssl rand -hex 32)"
echo "CRON_SECRET=$(openssl rand -hex 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)"
```

Exemple de `.env` complet :

```env
# Postgres
POSTGRES_USER=grandoral
POSTGRES_PASSWORD=<mot de passe fort généré>
POSTGRES_DB=grandoral

# App URLs (mettre l'URL publique réelle, pas localhost)
NEXT_PUBLIC_APP_URL=https://grandoral.example.com
BETTER_AUTH_URL=https://grandoral.example.com

# Better Auth
BETTER_AUTH_SECRET=<32+ bytes hex>

# Discord OAuth — ajouter https://grandoral.example.com/api/auth/callback/discord
# dans les redirect URLs du portail Discord Developer
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...

# Discord IDs autorisés à devenir superadmin (séparés par virgules)
SUPER_ADMIN_DISCORD_IDS=319842407829078016

# Cron — voir section 4
CRON_SECRET=<32+ bytes hex>

# Optionnel : si défini, fetch-news.ts utilise NewsAPI au lieu de Bing News RSS
# NEWS_API_KEY=

# Optionnel : port hôte sur lequel exposer l'app (défaut 3000). Adapter si le
# port est déjà pris par un autre service.
# HOST_PORT=4070
```

Le `docker-compose.yml` lit ces variables et **refuse de démarrer** si les secrets obligatoires manquent (`POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`, `CRON_SECRET`, etc.).

## 2. Build et démarrage

```sh
docker compose build
docker compose up -d
docker compose logs -f web
```

Au premier démarrage du conteneur `web`, `prisma migrate deploy` applique automatiquement les migrations.

## 2bis. Seed initial (une seule fois)

Après le premier `up -d`, peupler la base avec les thèmes et les sujets de référence :

```sh
docker exec grand-oral-web bun run scripts/seed.ts
```

Le seed est idempotent (upserts) — on peut le rejouer sans danger.

## 3. Reverse proxy

L'app n'expose pas de TLS — il faut un reverse proxy sur le host.

### Option A — Caddy (le plus simple)

`/etc/caddy/Caddyfile` :

```caddy
grandoral.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

Caddy gère le certificat Let's Encrypt automatiquement.

### Option B — nginx + Cloudflare

Un fichier `nginx.conf` modèle (gitignoré) est fourni à la racine du repo. Le TLS est terminé par Cloudflare ; l'origine nginx reste en HTTP sur le port 80 et proxy vers `127.0.0.1:${HOST_PORT}` avec :
- Headers de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- `X-Real-IP` lu depuis `CF-Connecting-IP`
- `X-Forwarded-Proto: https` forcé (Cloudflare termine TLS) pour que Better Auth émette des cookies sécurisés
- Support SSE (`proxy_buffering off`, `proxy_read_timeout 24h`) pour le chat / les commentaires temps réel

**Cloudflare** : enregistrement A pour `grand-oral` → IP du serveur, proxy orange activé. SSL/TLS mode "Flexible" (ou "Full" avec un Origin Certificate si tu préfères chiffrer aussi Cloudflare ↔ origine).

Sur le serveur :

```sh
sudo cp nginx.conf /etc/nginx/sites-available/grand-oral.conf
sudo ln -s /etc/nginx/sites-available/grand-oral.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Le fichier est volontairement gitignoré : il contient le domaine en dur.

## 4. Cron — fetch des news toutes les 24h

Le script `scripts/fetch-news.ts` peuple la table `NewsArticle`. Deux façons de le déclencher :

### Option A — `docker exec` depuis un cron host (recommandé)

Avantage : pas d'exposition HTTP supplémentaire, ne consomme pas de worker Next.js.

`crontab -e` (sur le host) :

```cron
# Tous les jours à 03:30
30 3 * * * docker exec grand-oral-web bun run scripts/fetch-news.ts >> /var/log/grand-oral-news.log 2>&1
```

### Option B — HTTP avec secret

Si tu préfères une URL :

```cron
30 3 * * * curl -fsS "http://127.0.0.1:3000/api/cron?secret=$CRON_SECRET" >> /var/log/grand-oral-news.log 2>&1
```

La route `/api/cron` :
- refuse l'appel si `CRON_SECRET` n'est pas défini (503),
- refuse si le secret fourni ne matche pas (401, comparaison `timingSafeEqual`),
- lance le script en arrière-plan (`spawn` détaché) pour ne pas bloquer le worker.

⚠️ Ne jamais déployer en prod sans `CRON_SECRET`.

## 5. Mise à jour

```sh
git pull
docker compose build web
docker compose up -d web
```

Les migrations Prisma sont appliquées automatiquement au redémarrage du conteneur.

## 6. Sauvegarde Postgres

```sh
docker exec grand-oral-db pg_dump -U grandoral grandoral | gzip > backup-$(date +%F).sql.gz
```

## 7. Accès Postgres pour debug

Postgres n'est pas exposé. Pour s'y connecter :

```sh
docker exec -it grand-oral-db psql -U grandoral -d grandoral
```

Si vraiment besoin d'un client externe, faire un tunnel SSH plutôt qu'ouvrir le port :

```sh
ssh -L 5432:127.0.0.1:5432 user@server  # côté host, mapper temporairement
```
