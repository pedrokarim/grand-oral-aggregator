export type AIProvider = "openai" | "anthropic" | "google" | "mistral" | "ollama";

export type SummaryLength = "short" | "medium" | "long";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface TTSConfig {
  voiceURI: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  autoPlay: boolean;
}

export interface AppSettings {
  ai: AIProviderConfig;
  autoSummarize: boolean;
  summaryLength: SummaryLength;
  tts: TTSConfig;
  theme: "light" | "dark" | "system";
  newsRefreshInterval: number;
  language: "fr" | "en";
}

export const DEFAULT_SETTINGS: AppSettings = {
  ai: { provider: "openai", apiKey: "", model: "gpt-4o-mini" },
  autoSummarize: false,
  summaryLength: "medium",
  tts: {
    voiceURI: "",
    lang: "fr-FR",
    rate: 1,
    pitch: 1,
    volume: 1,
    autoPlay: false,
  },
  theme: "system",
  newsRefreshInterval: 360,
  language: "fr",
};

export const summaryLengthLabels: Record<SummaryLength, string> = {
  short: "Court (3-5 phrases)",
  medium: "Moyen (résumé structuré)",
  long: "Long (analyse détaillée)",
};

export const providerLabels: Record<AIProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic (Claude)",
  google: "Google (Gemini)",
  mistral: "Mistral AI",
  ollama: "Ollama (Local)",
};

export const providerModels: Record<AIProvider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano"],
  anthropic: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20241022", "claude-opus-4-20250514"],
  google: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "mistral-medium-latest"],
  ollama: ["qwen3:8b", "qwen3:4b", "qwen3:30b", "qwen3-coder:30b", "gpt-oss:20b", "gemma3", "llama3.2", "mistral", "phi4", "deepseek-r1"],
};
