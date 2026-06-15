# Guide de génération des résumés IA — passation

Ce document explique **pas à pas** comment générer les résumés d'articles pour le Grand Oral,
les stocker en `.md` et les importer en base. Il est destiné à **toute IA (ou personne) qui
reprendra la génération**. Suivre ce process garantit la cohérence avec l'existant.

> Convention : les résumés sont générés avec le modèle **Claude Opus 4.8**
> (`provider = anthropic`, `model = claude-opus-4-8`), en longueur **`medium`**,
> du **plus récent au plus ancien**, par **lots de 30 articles**.

---

## 1. Architecture (où sont les données)

- **Base de données** : PostgreSQL dans un conteneur Docker.
  - Conteneur : `grand-oral-db`
  - Utilisateur : `grandoral` — Base : `grandoral`
  - ⚠️ Ne **pas** utiliser le client Prisma local (échec de connexion `ESERVFAIL`).
    Toujours passer par `docker exec ... psql`.
- **Tables utiles** :
  - `NewsArticle` (`id`, `slug`, `title`, `description`, `content`, `url`, `source`, `publishedAt`, `themeId`)
  - `Theme` (`id`, `name`)
  - `AiSummary` (`articleId`, `provider`, `model`, `content`, `createdAt`) — clé unique `(articleId, provider, model)`
- **Résumés en fichiers** : `resources/summaries/<dossier-theme>/<id>-<slug-court>.md`
- **Script d'import** : `scripts/build-summaries-sql.ts` (à lancer avec **bun**, voir §6)

### Clé de cache (TRÈS important)
L'app calcule le `model` stocké en base sous la forme :

```
model = `${model}::${length}::${PROMPT_VERSION}`
```

Actuellement : `claude-opus-4-8::medium::v2-problematique`.

- `PROMPT_VERSION` est défini dans `src/app/api/ai/summarize/route.ts` **et** dans
  `scripts/build-summaries-sql.ts`. Les deux **doivent rester synchronisés**.
- Si on modifie la structure des prompts/résumés, **incrémenter `PROMPT_VERSION`** aux deux endroits.

---

## 2. Récupérer le prochain lot de 30 articles (sans résumé Claude)

Lister les 30 articles les plus récents qui n'ont **pas encore** de résumé Claude Opus 4.8 :

```bash
docker exec grand-oral-db psql -U grandoral -d grandoral -P pager=off -c "
SELECT a.id, t.name AS theme, to_char(a.\"publishedAt\",'MM-DD') AS d,
       coalesce(length(nullif(a.content,'')),0) AS clen, left(a.title,52) AS titre
FROM \"NewsArticle\" a
JOIN \"Theme\" t ON t.id = a.\"themeId\"
WHERE NOT EXISTS (
  SELECT 1 FROM \"AiSummary\" s
  WHERE s.\"articleId\" = a.id
    AND s.provider = 'anthropic'
    AND s.model LIKE 'claude-opus-4-8%'
)
ORDER BY a.\"publishedAt\" DESC
LIMIT 30;"
```

Puis exporter le **contenu complet** des 30 articles en JSONL (lecture ligne par ligne ;
ne **pas** tout charger en un seul JSON, ça dépasse la limite de lecture) :

```bash
docker exec grand-oral-db psql -U grandoral -d grandoral -t -A -c "
SELECT row_to_json(x) FROM (
  SELECT a.id, a.slug, a.title, a.description, a.content, a.url, a.source,
         a.\"publishedAt\", t.name AS theme
  FROM \"NewsArticle\" a
  JOIN \"Theme\" t ON t.id = a.\"themeId\"
  WHERE NOT EXISTS (
    SELECT 1 FROM \"AiSummary\" s
    WHERE s.\"articleId\" = a.id AND s.provider = 'anthropic'
      AND s.model LIKE 'claude-opus-4-8%'
  )
  ORDER BY a.\"publishedAt\" DESC
  LIMIT 30
) x;" > /tmp/batchN.jsonl
```

Lire `/tmp/batchN.jsonl` par tranches (ex. 7-12 lignes à la fois).

---

## 3. Récupérer le contenu manquant

Certains articles ont `content = null` ou un contenu inexploitable (pages cookies, paywall).

1. Si `content` est exploitable → rédiger à partir de ce contenu.
2. Si `content` est vide/null → tenter de récupérer l'article via son `url` (outil de fetch web).
3. Si l'article est **payant** ou irrécupérable → rédiger à partir de la `description` + `title`,
   et **le signaler explicitement** dans le corps (ex. « contenu d'origine non disponible —
   synthèse à partir du descriptif »). Ne jamais inventer de faits.
4. **Doublons** (même événement, sources différentes, ex. dossier « Tchap ») : créer **un
   fichier par `id`** (chaque article reste une ligne distincte en base), mais **varier l'angle**
   (source, problématique, perspective) plutôt que de copier-coller.

---

## 4. Format d'un fichier résumé `.md`

Chemin : `resources/summaries/<dossier-theme>/<id>-<slug-court>.md`
(le `<slug-court>` est libre et lisible ; seul le front matter compte pour l'import).

**Front matter YAML obligatoire** (`id`, `provider`, `model` sont indispensables à l'import) :

```markdown
---
id: 4162
slug: le-slug-exact-de-l-article-en-base
theme: Mobilité
title: Titre lisible de l'article
source: Nom de la source
url: https://...
publishedAt: 2026-06-09T03:50:00
provider: anthropic
model: claude-opus-4-8
---
## Résumé

(2-4 phrases ; **gras** sur les notions/chiffres clés)

## Points clés

- Puce 1
- Puce 2
- ...

## Problématique pour le Grand Oral

(1 question d'oral, percutante, qui ouvre un débat)

## Analyse

(Mise en perspective : fiabilité de la source, recoupements avec d'autres articles,
limites, intérêt pour l'oral. Rester honnête sur les contenus partiels/promotionnels.)

## Pertinence Grand Oral

(1-3 phrases : pour quel sujet/angle l'article est utile, et à quel point.)
```

Contraintes :
- Le corps ne doit **jamais** contenir la chaîne `$SUM$` (délimiteur SQL, voir §6).
- `id` doit être un entier valide ; `provider` et `model` non vides ; corps non vide
  (sinon le script d'import lève une erreur).

### Style éditorial attendu
- En **français**, ton clair et synthétique.
- Mettre en **gras** chiffres, noms propres et concepts clés.
- Toujours fournir une **problématique** ouverte (angle « Grand Oral »).
- Être **critique** : signaler sources promotionnelles, paywall, données non vérifiées.
- Suggérer des **recoupements** entre articles d'un même dossier.

---

## 5. Mapping thèmes → dossiers

Le `name` du thème en base se traduit en nom de dossier « slugifié » :

| Thème (DB)                 | Dossier (`resources/summaries/`) |
|----------------------------|----------------------------------|
| Big Data                   | `big-data`                       |
| Blockchain                 | `blockchain`                     |
| Cloud et virtualisation    | `cloud-et-virtualisation`        |
| Cybersecurité              | `cybersecurite`                  |
| Développement              | `developpement`                  |
| Intelligence artificielle  | `intelligence-artificielle`      |
| Management et stratégie    | `management-et-strategie`        |
| Mobilité                   | `mobilite`                       |
| Optimisation du SI         | `optimisation-du-si`             |
| SI et environnement        | `si-et-environnement`            |

Règle de slugification : minuscules, accents retirés, espaces → tirets.
Créer le dossier s'il n'existe pas encore (ex. `cloud-et-virtualisation` n'a pas encore de fichiers).

---

## 6. Générer le SQL puis importer en base

Le script parcourt **tous** les `.md` de `resources/summaries/`, lit le front matter et produit
des `INSERT ... ON CONFLICT DO UPDATE` (idempotent : on peut le relancer sans créer de doublons).

⚠️ Le script utilise `import.meta.dir` → **lancer avec bun**, pas avec node/npx/tsx.
(Si `bun` n'est pas dans le PATH : `~/.bun/bin/bun`.)

```bash
# 1) Générer le SQL (depuis la racine du projet)
~/.bun/bin/bun run scripts/build-summaries-sql.ts > /tmp/import-summaries.sql

# 2) Importer dans Postgres (transaction, stop à la première erreur)
docker exec -i grand-oral-db psql -U grandoral -d grandoral -v ON_ERROR_STOP=1 \
  < /tmp/import-summaries.sql
```

Le script affiche sur stderr le nombre de résumés prêts. Le SQL upserte tous les fichiers
présents ; les anciens sont simplement mis à jour à l'identique (sans danger).

---

## 7. Vérifier

```bash
# Total de résumés Claude Opus 4.8
docker exec grand-oral-db psql -U grandoral -d grandoral -t -A -c "
SELECT count(*) FROM \"AiSummary\"
WHERE provider='anthropic' AND model LIKE 'claude-opus-4-8%';"

# Vérifier que les ids du lot courant sont bien présents
docker exec grand-oral-db psql -U grandoral -d grandoral -t -A -c "
SELECT count(*) FROM \"AiSummary\"
WHERE provider='anthropic' AND model LIKE 'claude-opus-4-8%'
  AND \"articleId\" IN (/* coller ici les 30 ids du lot */);"
```

Le compteur total doit augmenter de ~30 par lot (moins si certains articles avaient déjà
un résumé via un autre `PROMPT_VERSION`).

---

## 8. Côté application (pour information)

- API : `src/app/api/ai/summarize/route.ts`
  - `GET ?slug=...` renvoie le résumé en cache pour `(articleId, provider, cacheModel)` ;
    **fallback** : si l'exact n'existe pas, renvoie le résumé le plus récent de l'article
    (tout provider/modèle confondu) pour ne pas dépendre des réglages exacts du client.
  - `POST` génère et met en cache un résumé.
- Prompts : `src/lib/ai-providers.ts` (si on les modifie → **bump `PROMPT_VERSION`**, §1).
- Réglages/modèles disponibles : `src/lib/settings.ts` (`claude-opus-4-8` y est listé).
- Affichage : `src/app/actualites/[slug]/page.tsx` (le résumé s'ouvre automatiquement
  s'il existe ; le bouton « Résumé IA » est toujours affiché).

---

## 9. Résumé de la boucle (TL;DR)

1. Lister les 30 prochains articles sans résumé Claude (§2).
2. Exporter leur contenu en JSONL et le lire par tranches (§2).
3. Récupérer le contenu manquant si besoin (web fetch / descriptif), sans inventer (§3).
4. Écrire 1 fichier `.md` par article, dans le bon dossier de thème, au bon format (§4-5).
5. Générer le SQL avec bun, puis importer via `docker exec psql` (§6).
6. Vérifier le compteur et les ids du lot (§7).
7. Recommencer pour le lot suivant.
