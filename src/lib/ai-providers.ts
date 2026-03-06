import type { AIProviderConfig } from "./settings";

const SUBJECT_SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Génère un résumé structuré du sujet proposé pour aider un étudiant à préparer sa soutenance orale.

Structure ta réponse ainsi :
1. **Contexte** : Présente le sujet et son importance dans le domaine IT
2. **Enjeux** : Identifie les enjeux principaux (techniques, économiques, éthiques)
3. **Arguments clés** : 3-4 arguments développés avec des exemples concrets
4. **Contre-arguments** : Points de vue opposés à considérer
5. **Conclusion** : Synthèse et ouverture possible

Sois concis, professionnel et utilise des exemples récents et pertinents. Adopte un niveau d'analyse adapté au Master.`;

const ARTICLE_SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral de dernière année de Master en informatique.
Résume cet article d'actualité de manière structurée pour aider un étudiant à l'utiliser dans sa préparation.

Structure ta réponse ainsi :
1. **Résumé** : Synthèse de l'article en quelques phrases
2. **Points clés** : Les informations essentielles à retenir
3. **Analyse** : Ton analyse critique de l'article
4. **Pertinence Grand Oral** : Comment cet article peut être utilisé dans le cadre du Grand Oral Master

Sois concis, professionnel et mets en avant la pertinence pour un étudiant en Master informatique.`;

export async function generateSummary(
  config: AIProviderConfig,
  subject: string,
  theme: string,
  articleContent?: string
): Promise<string> {
  const sysPrompt = articleContent ? ARTICLE_SYSTEM_PROMPT : SUBJECT_SYSTEM_PROMPT;
  const userPrompt = articleContent
    ? `Thème : ${theme}\nArticle : ${subject}\n\nContenu :\n${articleContent.slice(0, 3000)}`
    : `Thème : ${theme}\nSujet : ${subject}`;

  switch (config.provider) {
    case "openai":
      return callOpenAI(config, sysPrompt, userPrompt);
    case "anthropic":
      return callAnthropic(config, sysPrompt, userPrompt);
    case "google":
      return callGemini(config, sysPrompt, userPrompt);
    case "mistral":
      return callMistral(config, sysPrompt, userPrompt);
    case "ollama":
      return callOllama(config, sysPrompt, userPrompt);
    default:
      throw new Error(`Provider inconnu: ${config.provider}`);
  }
}

async function callOpenAI(config: AIProviderConfig, systemPrompt: string, prompt: string): Promise<string> {
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
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function callAnthropic(config: AIProviderConfig, systemPrompt: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

async function callGemini(config: AIProviderConfig, systemPrompt: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
      generationConfig: { maxOutputTokens: 2000 },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

async function callMistral(config: AIProviderConfig, systemPrompt: string, prompt: string): Promise<string> {
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
      max_tokens: 2000,
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
