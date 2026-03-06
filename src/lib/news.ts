export const themeKeywords: Record<string, string[]> = {
  "SI et environnement": [
    "green IT",
    "sobriété numérique",
    "datacenter énergie",
    "numérique responsable",
  ],
  Cybersecurité: [
    "cybersécurité",
    "cyberattaque",
    "ransomware",
    "ANSSI",
    "SOC sécurité",
  ],
  "Cloud et virtualisation": [
    "cloud computing",
    "migration cloud",
    "cloud souverain",
    "conteneurisation",
  ],
  "Big Data": [
    "big data",
    "data analytics",
    "données massives",
    "RGPD données",
  ],
  Développement: [
    "DevOps",
    "CI/CD",
    "qualité logicielle",
    "déploiement continu",
  ],
  Mobilité: ["BYOD entreprise", "mobilité numérique", "MDM mobile", "télétravail IT"],
  "Management et stratégie": [
    "DSI transformation",
    "gouvernance IT",
    "transformation digitale",
  ],
  Blockchain: ["blockchain", "smart contract", "Web3", "crypto entreprise"],
  "Intelligence artificielle": [
    "intelligence artificielle",
    "IA entreprise",
    "machine learning",
    "LLM IA",
  ],
  "Optimisation du SI": [
    "optimisation SI",
    "ITIL",
    "amélioration continue IT",
    "veille technologique",
  ],
};

export interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  source: string;
  publishedAt: string;
  theme: string;
}

export interface CachedNews {
  articles: NewsArticle[];
  fetchedAt: string;
}
