import type { AIProviderConfig, SummaryLength } from "./settings";

const SHORT_SUBJECT_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Donne un résumé très court (3 à 5 phrases) du sujet proposé, en markdown, avec **les mots-clés en gras**.
Commence par une ligne **Problématique :** formulée comme une question ouverte prête à être utilisée à l'oral.
Puis va à l'essentiel : contexte, enjeu principal, et un exemple concret. Pas de titres ni de tableaux.`;

const MEDIUM_SUBJECT_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Génère un résumé structuré en **markdown** du sujet proposé pour aider un étudiant à préparer sa soutenance orale.

Structure ta réponse ainsi (utilise des titres ## et des listes) :
1. **Contexte** : Présente le sujet et son importance dans le domaine IT
2. **Problématique** : Formule une question centrale (ouverte, directrice) qui servira de fil rouge à l'oral. Explique brièvement pourquoi cette question est pertinente.
3. **Enjeux** : Identifie les enjeux principaux (techniques, économiques, éthiques)
4. **Arguments clés** : 3-4 arguments développés avec des exemples concrets
5. **Contre-arguments** : Points de vue opposés à considérer
6. **Conclusion** : Synthèse et ouverture possible

Sois concis, professionnel et utilise des exemples récents et pertinents.`;

const LONG_SUBJECT_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Génère une analyse approfondie en **markdown** du sujet proposé.

Inclus des titres ## détaillés, des listes à puces, et un tableau comparatif quand pertinent. Couvre :
- Contexte historique et état de l'art
- **Problématisation** : une question centrale explicite pour le Grand Oral, accompagnée de 2-3 sous-questions qui structureront la réflexion
- Enjeux techniques, économiques, éthiques et sociétaux (développés)
- 5+ arguments avec exemples chiffrés ou cas concrets
- Contre-arguments et limites
- Perspectives d'évolution
- Conclusion et ouverture vers d'autres sujets

Réponse complète et professionnelle, niveau Master.`;

const SHORT_ARTICLE_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Résume cet article en **3-5 phrases maximum**, en markdown avec **les points clés en gras**.
Termine par une ligne **Problématique pour le Grand Oral :** formulée comme une question que cet article invite à se poser. Pas de titres ni de tableaux.`;

const MEDIUM_ARTICLE_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Résume cet article d'actualité en **markdown** pour aider un étudiant à l'utiliser dans sa préparation.

Structure ta réponse ainsi (utilise des titres ## et des listes) :
1. **Résumé** : Synthèse de l'article en quelques phrases
2. **Points clés** : Les informations essentielles à retenir (liste à puces)
3. **Problématique pour le Grand Oral** : Formule une question ouverte que cet article permet de soulever à l'oral, en lien avec le thème du sujet
4. **Analyse** : Ton analyse critique de l'article
5. **Pertinence Grand Oral** : Comment cet article peut être utilisé (arguments, exemples, chiffres réutilisables)

Sois concis, professionnel et mets en avant la pertinence pour un étudiant en Master informatique.`;

const LONG_ARTICLE_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Produis une analyse détaillée de cet article en **markdown**.

Inclus :
- Un résumé complet
- Un tableau markdown des points clés (colonnes : Élément / Détails)
- **Problématisation pour le Grand Oral** : une question centrale explicite à laquelle l'article apporte des éléments de réponse, plus 2-3 sous-questions connexes
- Une analyse critique nuancée (points forts / limites)
- Le lien avec les enjeux plus larges du domaine
- Plusieurs angles d'utilisation pour le Grand Oral
- Des questions de jury possibles

Réponse riche et structurée, niveau Master.`;

const SUBJECT_PROMPTS: Record<SummaryLength, string> = {
  short: SHORT_SUBJECT_PROMPT,
  medium: MEDIUM_SUBJECT_PROMPT,
  long: LONG_SUBJECT_PROMPT,
};

const ARTICLE_PROMPTS: Record<SummaryLength, string> = {
  short: SHORT_ARTICLE_PROMPT,
  medium: MEDIUM_ARTICLE_PROMPT,
  long: LONG_ARTICLE_PROMPT,
};

const THEME_FICHE_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Rédige une **fiche de révision complète** en **markdown** pour ce thème. Un étudiant doit pouvoir s'en servir pour couvrir le thème entier à l'oral.

Structure obligatoire avec des titres ## et des listes :
## Présentation du thème
Contexte général, pourquoi ce thème compte aujourd'hui, ancrage dans l'actualité IT.

## Problématisation
Propose **3 problématiques centrales** (questions ouvertes) que ce thème permet de poser au Grand Oral. Pour chacune, en une phrase, explique l'angle.

## Concepts et notions clés
Liste les notions techniques, acronymes, frameworks, normes incontournables (liste à puces, avec courte définition).

## Enjeux
Classe les enjeux en catégories : techniques, économiques, éthiques/juridiques, sociétaux. Utilise une liste à puces hiérarchisée ou un tableau markdown (colonnes : Catégorie / Enjeu / Illustration concrète).

## Arguments et exemples
5 à 7 arguments fondamentaux à mobiliser, chacun avec un exemple concret récent (entreprise, chiffre, incident, réglementation).

## Sujets de préparation associés
À partir de la liste de sujets fournie, sélectionne les **5 sujets les plus représentatifs**. Pour chacun : rattache-le à l'une des 3 problématiques et indique en 1-2 lignes l'angle d'attaque.

## Contre-arguments et points de vigilance
Points de vue opposés, limites, arguments critiques que le jury pourrait soulever.

## Perspectives d'évolution
Où va le thème dans les 3-5 ans ? Tendances émergentes, ruptures possibles.

## Ouvertures
Liens vers d'autres thèmes du Grand Oral.

Sois exhaustif, structuré, et précis. Niveau Master. Privilégie les exemples récents (2024-2026).`;

const MAX_TOKENS_BY_LENGTH: Record<SummaryLength, number> = {
  short: 400,
  medium: 1500,
  long: 3500,
};

const MAX_TOKENS_THEME_FICHE = 6000;

export async function generateSummary(
  config: AIProviderConfig,
  subject: string,
  theme: string,
  articleContent?: string,
  length: SummaryLength = "medium"
): Promise<string> {
  const sysPrompt = articleContent ? ARTICLE_PROMPTS[length] : SUBJECT_PROMPTS[length];
  const contentLimit = length === "long" ? 6000 : length === "medium" ? 3000 : 1500;
  const userPrompt = articleContent
    ? `Thème : ${theme}\nArticle : ${subject}\n\nContenu :\n${articleContent.slice(0, contentLimit)}`
    : `Thème : ${theme}\nSujet : ${subject}`;
  const maxTokens = MAX_TOKENS_BY_LENGTH[length];

  return callProvider(config, sysPrompt, userPrompt, maxTokens);
}

export async function generateThemeFiche(
  config: AIProviderConfig,
  theme: string,
  subjects: string[],
): Promise<string> {
  const subjectsList = subjects.slice(0, 25).map((s, i) => `${i + 1}. ${s}`).join("\n");
  const userPrompt = `Thème : ${theme}\n\nListe des sujets de préparation du thème :\n${subjectsList}`;
  return callProvider(config, THEME_FICHE_PROMPT, userPrompt, MAX_TOKENS_THEME_FICHE);
}

function callProvider(
  config: AIProviderConfig,
  sysPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  switch (config.provider) {
    case "openai":
      return callOpenAI(config, sysPrompt, userPrompt, maxTokens);
    case "anthropic":
      return callAnthropic(config, sysPrompt, userPrompt, maxTokens);
    case "google":
      return callGemini(config, sysPrompt, userPrompt, maxTokens);
    case "mistral":
      return callMistral(config, sysPrompt, userPrompt, maxTokens);
    case "ollama":
      return callOllama(config, sysPrompt, userPrompt);
    default:
      throw new Error(`Provider inconnu: ${config.provider}`);
  }
}

async function callOpenAI(config: AIProviderConfig, systemPrompt: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function callAnthropic(config: AIProviderConfig, systemPrompt: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

async function callGemini(config: AIProviderConfig, systemPrompt: string, prompt: string, maxTokens: number): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

async function callMistral(config: AIProviderConfig, systemPrompt: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function callOllama(config: AIProviderConfig, systemPrompt: string, prompt: string): Promise<string> {
  const baseUrl = config.baseUrl || "http://localhost:11434";
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message.content;
}
