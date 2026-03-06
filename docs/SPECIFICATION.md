# Grand Oral Agregator - Specification

## Objectif

Plateforme web pour centraliser, explorer et enrichir les sujets du Grand Oral (domaine INFO) avec des actualites automatiquement recuperees en lien avec chaque theme.

---

## Source de donnees

**Fichier Excel** : `Themes et sujets grand oral tout domaine_INFO_BLANC_v09.01.2025.xlsx`

### Structure des donnees

| Champ   | Description                          | Exemple                        |
| ------- | ------------------------------------ | ------------------------------ |
| Type    | Type de sujet                        | Sujet de preparation           |
| Domaine | Domaine d'expertise                  | INFO                           |
| Theme   | Theme principal                      | Cybersecurite                  |
| Sujet   | Intitule complet du sujet            | PME, les grands oublies de la Cybersecurite |

### Themes identifies (10)

1. SI et environnement (5 sujets)
2. Cybersecurite (8 sujets)
3. Cloud et virtualisation (7 sujets)
4. Big Data (7 sujets)
5. Developpement (6 sujets)
6. Mobilite (3 sujets)
7. Management et strategie (7 sujets)
8. Blockchain (5 sujets)
9. Intelligence artificielle (6 sujets)
10. Optimisation du SI (7 sujets)

**Total : 61 sujets**

---

## Architecture technique

### Stack

- **Runtime** : Bun
- **Framework** : Next.js (App Router)
- **UI** : shadcn/ui + Tailwind CSS
- **Donnees** : JSON statique genere depuis le script de conversion Excel -> CSV/JSON

### Scripts utilitaires

| Script                            | Role                                              |
| --------------------------------- | ------------------------------------------------- |
| `scripts/convert-xlsx-to-csv.ts`  | Convertit le fichier Excel en CSV + JSON utilisables |

### Fichiers de donnees generes (dans `data/`)

| Fichier        | Contenu                                      |
| -------------- | -------------------------------------------- |
| `sujets.csv`   | Tous les sujets au format CSV                |
| `sujets.json`  | Tous les sujets au format JSON               |
| `themes.json`  | Sujets groupes par theme                     |

---

## Fonctionnalites

### 1. Navigation par themes (Sidebar)

- Sidebar persistante a gauche avec la liste des 10 themes
- Compteur de sujets par theme
- Theme actif mis en surbrillance
- Responsive : sidebar en drawer sur mobile

### 2. Liste des sujets par theme

- Affichage des sujets filtres par theme selectionne
- Vue "tous les sujets" par defaut
- Recherche textuelle dans les sujets
- Filtres par type de sujet (preparation / officiel)

### 3. Page detail d'un sujet

- Intitule complet du sujet
- Theme et domaine associes
- Section "Actualites liees" (voir ci-dessous)

### 4. Agregation automatique d'actualites

Systeme qui recupere automatiquement des actualites en lien avec chaque theme.

#### Approche

- **API News** : Utiliser une API d'actualites (ex: NewsAPI, Google News RSS, ou scraping RSS de sources fiables)
- **Mots-cles** : Chaque theme a des mots-cles associes pour la recherche
- **Mapping mots-cles par theme** :

| Theme                     | Mots-cles de recherche                                          |
| ------------------------- | --------------------------------------------------------------- |
| SI et environnement       | green IT, sobriete numerique, datacenter energie, IT durable    |
| Cybersecurite             | cybersecurite, cyberattaque, SOC, ransomware, ANSSI            |
| Cloud et virtualisation   | cloud computing, migration cloud, cloud souverain, conteneur   |
| Big Data                  | big data, data analytics, donnees massives, RGPD data          |
| Developpement             | DevOps, CI/CD, qualite logicielle, deploiement continu         |
| Mobilite                  | BYOD, mobilite entreprise, MDM, travail mobile                 |
| Management et strategie   | DSI, gouvernance IT, ITIL, transformation digitale             |
| Blockchain                | blockchain, crypto, smart contract, Web3                       |
| Intelligence artificielle | intelligence artificielle, IA entreprise, machine learning, LLM|
| Optimisation du SI        | optimisation SI, ITIL, amelioration continue, veille IT        |

- **Frequence** : Actualites recuperees a la demande (cote client) ou via un cron/route API
- **Cache** : Mise en cache des resultats pour eviter les appels excessifs

### 5. Dashboard (page d'accueil)

- Vue d'ensemble : nombre total de sujets, repartition par theme (graphique)
- Dernieres actualites toutes categories confondues
- Acces rapide aux themes

---

## Structure du projet

```
grand-oral-agregator/
├── scripts/
│   └── convert-xlsx-to-csv.ts       # Script Bun de conversion
├── data/
│   ├── sujets.csv
│   ├── sujets.json
│   └── themes.json
├── docs/
│   └── SPECIFICATION.md             # Ce fichier
├── web/                             # Application Next.js
│   ├── app/
│   │   ├── layout.tsx               # Layout principal avec sidebar
│   │   ├── page.tsx                 # Dashboard
│   │   ├── themes/
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Liste des sujets par theme
│   │   └── api/
│   │       └── news/
│   │           └── route.ts         # API route pour fetch les actualites
│   ├── components/
│   │   ├── sidebar.tsx
│   │   ├── subject-card.tsx
│   │   ├── news-feed.tsx
│   │   ├── search-bar.tsx
│   │   └── theme-chart.tsx
│   ├── lib/
│   │   ├── data.ts                  # Chargement des donnees JSON
│   │   └── news.ts                  # Logique de fetch des actualites
│   └── public/
│       └── data/                    # Donnees JSON copiees pour acces statique
├── package.json
└── bun.lockb
```

---

## Composants UI (shadcn)

| Composant        | Usage                                            |
| ---------------- | ------------------------------------------------ |
| Sidebar          | Navigation par themes                            |
| Card             | Affichage des sujets et actualites               |
| Badge            | Tags de theme / domaine                          |
| Input            | Barre de recherche                               |
| Select           | Filtres (type de sujet)                          |
| Sheet/Drawer     | Sidebar mobile                                   |
| Separator        | Separateurs visuels                              |
| ScrollArea       | Zones scrollables pour les listes                |
| Chart            | Graphique de repartition des sujets par theme    |

---

## Etapes de realisation

1. **Script de conversion** : Excel -> CSV/JSON via Bun + xlsx
2. **Init Next.js** : `bunx create-next-app` + shadcn setup
3. **Layout & Sidebar** : Structure de navigation avec les 10 themes
4. **Pages themes** : Listing des sujets filtres par theme
5. **Recherche & filtres** : Barre de recherche + filtres
6. **Systeme d'actualites** : API route + integration news
7. **Dashboard** : Page d'accueil avec stats et graphiques
8. **Polish** : Responsive, animations, UX finale
