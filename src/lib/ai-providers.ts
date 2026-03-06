import type { AIProviderConfig } from "./settings";

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la préparation au Grand Oral du BTS SIO (option SISR/SLAM).
Génère un résumé structuré du sujet proposé pour aider un étudiant à préparer son oral de 15 minutes.

Structure ta réponse ainsi :
1. **Contexte** : Présente le sujet et son importance dans le domaine IT
2. **Enjeux** : Identifie les enjeux principaux (techniques, économiques, éthiques)
3. **Arguments clés** : 3-4 arguments développés avec des exemples concrets
4. **Contre-arguments** : Points de vue opposés à considérer
5. **Conclusion** : Synthèse et ouverture possible

Sois concis, professionnel et utilise des exemples récents et pertinents.`;

export async function generateSummary(
  config: AIProviderConfig,
  subject: string,
  theme: string
): Promise<string> {
  const userPrompt = `Thème : ${theme}\nSujet : ${subject}`;

  switch (config.provider) {
    case "openai":
      return callOpenAI(config, userPrompt);
    case "anthropic":
      return callAnthropic(config, userPrompt);
    case "google":
      return callGemini(config, userPrompt);
    case "mistral":
      return callMistral(config, userPrompt);
    case "ollama":
      return callOllama(config, userPrompt);
    default:
      throw new Error(`Provider inconnu: ${config.provider}`);
  }
}

async function callOpenAI(config: AIProviderConfig, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function callAnthropic(config: AIProviderConfig, prompt: string): Promise<string> {
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
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

async function callGemini(config: AIProviderConfig, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
      generationConfig: { maxOutputTokens: 2000 },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

async function callMistral(config: AIProviderConfig, prompt: string): Promise<string> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

async function callOllama(config: AIProviderConfig, prompt: string): Promise<string> {
  const baseUrl = config.baseUrl || "http://localhost:11434";
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message.content;
}
