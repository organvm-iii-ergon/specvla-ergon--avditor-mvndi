export type AIProvider = "gemini" | "openai" | "claude";

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  keyPlaceholder: string;
  keyPrefix: string;
  getKeyUrl: string;
  defaultModel: string;
}

export const AI_PROVIDERS: ProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    keyPlaceholder: "AIzaSy...",
    keyPrefix: "AIza",
    getKeyUrl: "https://aistudio.google.com/",
    defaultModel: "gemini-1.5-flash",
  },
  {
    id: "openai",
    name: "OpenAI",
    keyPlaceholder: "sk-...",
    keyPrefix: "sk-",
    getKeyUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    keyPlaceholder: "sk-ant-...",
    keyPrefix: "sk-ant-",
    getKeyUrl: "https://console.anthropic.com/",
    defaultModel: "claude-sonnet-4-20250514",
  },
];

export function getProviderConfig(id: AIProvider): ProviderConfig {
  return AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];
}

export function getStoredProvider(): AIProvider {
  if (typeof window === "undefined") return "gemini";
  return (localStorage.getItem("ai_provider") as AIProvider) || "gemini";
}

export function getStoredApiKey(provider?: AIProvider): string | null {
  if (typeof window === "undefined") return null;
  const p = provider || getStoredProvider();
  // Backward compatibility: gemini key stored as "gemini_api_key"
  if (p === "gemini") return localStorage.getItem("gemini_api_key");
  return localStorage.getItem(`${p}_api_key`);
}
