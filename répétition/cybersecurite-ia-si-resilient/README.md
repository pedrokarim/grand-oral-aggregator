# Cybersécurité et IA : l'avenir d'un SI résilient — dossier de répétition

> **Sujet blanc** — Domaine INFO · Thème Cybersécurité · Grand Oral CESI Master Info
> **Auteur** : Karim · Filière « Manager le SI »
> **Angle** : équilibré, point de vue manager du SI (technique + organisationnel + juridique)

Dossier autonome pour préparer et répéter la soutenance. **Sujet imposé uniquement** — aucun contenu personnel (les 5 min de projet professionnel sont gérées séparément par Karim, hors de ce dossier).

---

## Carte du dossier

| Fichier | Rôle |
|---|---|
| `00-plan.md` | Problématique, plan 3 parties, chronométrage 13 slides, chiffres-pilier |
| `slides/01…13-*.md` | Les 13 slides : contenu visible + **notes orales** (à dire) + astuce de scène + sources |
| `sources.md` | Bibliographie centralisée — **25 entrées vérifiées**, format tableau, avec URL |
| `questions-jury.md` | **13 questions probables** du jury + réponses sourcées, prêtes à l'oral |
| `slides.html` | **Deck HTML autonome** — navigation clavier, barre de progression, export PDF |
| `cybersecurite-ia-si-resilient.pptx` | **PowerPoint natif éditable** (13 slides, thème clair) — généré depuis les contenus + graphiques |
| `assets/charts/` | 5 graphiques sur mesure — un `.svg` (source) + un `.png` (Google Slides) chacun |
| `assets/img/` | (réservé — illustrations externes libres de droits si ajoutées) |

---

## Structure de la soutenance

> **Problématique** — « Comment le manager du SI peut-il faire de l'IA un levier de résilience, plutôt qu'un nouveau facteur de risque, sur les plans technique, organisationnel et juridique ? »

- **I. L'IA, bouclier** — la cyberdéfense augmentée (SIEM, SOAR, UEBA, XDR ; IBM 2025)
- **II. L'IA, arme** — la menace se réinvente + l'IA devient une cible (phishing IA, deepfakes, empoisonnement, OWASP LLM)
- **III. Bâtir la résilience** — cadre réglementaire (NIS2, DORA, AI Act, RGPD) + leviers techniques / organisationnels / juridiques

Fil rouge : **« l'épée à double tranchant »** — la même IA sert la défense et l'attaque ; le différenciateur devient la **résilience** (« assume the breach »).

---

## Graphiques (`assets/charts/`)

| Fichier | Contenu | Utilisé slide |
|---|---|---|
| `chart-01-marche-ia-cyber` | Marché IA-cybersécurité ≈ 26 → 86 Md$ | *bonus (asset macro à glisser librement)* |
| `chart-02-cout-violation-ibm` | Coût d'une violation avec/sans IA (−1,9 M$) | 05 |
| `chart-03-menace-secteurs` | Répartition sectorielle ANSSI + chiffres clés | 08 |
| `chart-04-reglementation-timeline` | Frise RGPD → DORA → NIS2 → AI Act | 10 |
| `chart-05-resilience-triangle` | Triangle des 3 plans de la résilience | 11 |

> **SVG = source éditable** (rendu net dans `slides.html`). **PNG (3× la viewBox, fond transparent) = version à importer** dans Google Docs / Slides / PowerPoint, qui refusent les SVG natifs.

---

## Images d'illustration (`assets/img/`) — libres de droits

Toutes proviennent de **Wikimedia Commons**, licences vérifiées via l'API Commons. Logos institutionnels en **domaine public** ; photo data center en **CC BY-SA 3.0** (créditée sur la slide).

| Fichier | Contenu | Licence | Utilisé slide |
|---|---|---|---|
| `datacenter.jpg` | Salle serveurs (CERN) | CC BY-SA 3.0 — crédit affiché | 06 |
| `enisa-logo.png` | Logo ENISA | Domaine public | 07 |
| `anssi-logo.jpg` | Logo ANSSI | Domaine public | 08 |
| `eu-flag.svg` / `.png` | Drapeau européen | Domaine public | 09, 10 |
| `cnil-logo.svg` / `.png` | Logo CNIL (2016) | Domaine public | 10 |
| `nist-logo.svg` / `.png` | Logo NIST | Domaine public | *bonus (Zero Trust / CSF)* |

> Dans `slides.html`, les logos apparaissent dans des « chips » blanches en haut à droite des slides concernées (rendu net sur fond sombre). Pour Google Slides, utiliser les `.png` (le drapeau/CNIL/NIST ont un `.png` généré ; ANSSI/ENISA sont déjà en raster).

---

## Chiffres-pilier à connaître par cœur

- **− 1,9 M$** par violation avec IA + automatisation · détection **80 j** plus rapide *(IBM 2025)*
- **80 %+** des e-mails de phishing dopés à l'IA *(ENISA 2025)*
- **25,6 M$** détournés par un deepfake de DAF en visio *(Arup, 2024)*
- **1 366 / 128** incidents / rançongiciels ANSSI 2025 · **48 %** de PME
- **NIS2** : 10 M€ ou 2 % CA · notification **24 h / 72 h / 30 j**

---

## Utilisation

- **Répéter** : ouvrir `slides.html` dans **Chrome** (flèches ← →, touches 1-9, `Home`/`End`, bouton « Imprimer / PDF »).
- **Format slide** : le deck est une **scène 16:9 fixe (1280×720) qui se met à l'échelle** pour remplir la fenêtre sans déformer — ce que tu vois à l'écran = exactement une slide, sans débordement. L'export PDF sort en pages 16:9.
- **PowerPoint prêt à l'emploi** : ouvrir **`cybersecurite-ia-si-resilient.pptx`** directement dans PowerPoint (thème clair, police Segoe UI, 13 slides éditables, graphiques et logos intégrés). Pour le régénérer après modif des graphiques : `python répétition/_build_pptx.py cybersecurite-ia-si-resilient`.
- **Construire un support à la main (Google Slides)** : importer les **`.png`** de `assets/charts/` (jamais les `.svg`).
- **Mémoriser** : lire les *Notes orales* de chaque `slides/0X-*.md` — c'est le texte à dire au jury.
- **S'entraîner au Q&A** : `questions-jury.md`.

---

## Garde-fous respectés

- ✅ Aucune source inventée — toutes vérifiées (`sources.md`), doute = `[À VÉRIFIER]`.
- ✅ Aucun contenu personnel dans le deck (projet pro géré hors dossier).
- ✅ Posture technique (technologies réelles nommées : SIEM, SOAR, XDR, Zero Trust, MLSecOps, OWASP LLM, MITRE ATLAS).
- ✅ Ton équilibré : valeur d'abord (Partie I), dérives ensuite (Partie II).
- ✅ Problématique 3 plans → chacun réellement délivré (organisationnel = Partie III + slide 11).
- ✅ Problématique/plan **avant** l'accroche · transitions explicites · chiffres et usages séparés (slide 08).
