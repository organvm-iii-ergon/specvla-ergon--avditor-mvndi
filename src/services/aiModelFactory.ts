import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export type AIProviderType = "gemini" | "openai" | "claude";

/**
 * Returns a Vercel AI SDK model instance for the given provider and API key.
 * Defaults to Gemini if the provider is unrecognized.
 */
export function createAIModel(provider: AIProviderType, apiKey: string) { // allow-secret
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })("gpt-4o-mini"); // allow-secret
    case "claude":
      return createAnthropic({ apiKey })("claude-sonnet-4-20250514"); // allow-secret
    case "gemini":
    default:
      return createGoogleGenerativeAI({ apiKey })("gemini-1.5-flash"); // allow-secret
  }
}
