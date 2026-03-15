import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  AI_PROVIDERS,
  getProviderConfig,
  getStoredProvider,
  getStoredApiKey,
} from "./aiProvider";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("aiProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("AI_PROVIDERS", () => {
    it("has three providers", () => {
      expect(AI_PROVIDERS).toHaveLength(3);
    });

    it("includes gemini, openai, and claude", () => {
      const ids = AI_PROVIDERS.map((p) => p.id);
      expect(ids).toEqual(["gemini", "openai", "claude"]);
    });

    it("each provider has required fields", () => {
      for (const provider of AI_PROVIDERS) {
        expect(provider.id).toBeTruthy();
        expect(provider.name).toBeTruthy();
        expect(provider.keyPlaceholder).toBeTruthy();
        expect(provider.keyPrefix).toBeTruthy();
        expect(provider.getKeyUrl).toMatch(/^https:\/\//);
        expect(provider.defaultModel).toBeTruthy();
      }
    });
  });

  describe("getProviderConfig", () => {
    it("returns correct config for gemini", () => {
      const config = getProviderConfig("gemini");
      expect(config.id).toBe("gemini");
      expect(config.name).toBe("Google Gemini");
    });

    it("returns correct config for openai", () => {
      const config = getProviderConfig("openai");
      expect(config.id).toBe("openai");
      expect(config.name).toBe("OpenAI");
    });

    it("returns correct config for claude", () => {
      const config = getProviderConfig("claude");
      expect(config.id).toBe("claude");
      expect(config.name).toBe("Anthropic Claude");
    });

    it("falls back to gemini for unknown provider", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const config = getProviderConfig("unknown" as any);
      expect(config.id).toBe("gemini");
    });
  });

  describe("getStoredProvider", () => {
    it("defaults to gemini when nothing stored", () => {
      expect(getStoredProvider()).toBe("gemini");
    });

    it("returns stored provider", () => {
      localStorageMock.setItem("ai_provider", "openai");
      expect(getStoredProvider()).toBe("openai");
    });

    it("returns stored claude provider", () => {
      localStorageMock.setItem("ai_provider", "claude");
      expect(getStoredProvider()).toBe("claude");
    });
  });

  describe("getStoredApiKey", () => {
    it("returns null when no key stored", () => {
      expect(getStoredApiKey()).toBeNull();
    });

    it("returns gemini key using backward-compatible key name", () => {
      localStorageMock.setItem("gemini_api_key", "AIzaSyTest123");
      expect(getStoredApiKey("gemini")).toBe("AIzaSyTest123");
    });

    it("returns openai key", () => {
      localStorageMock.setItem("openai_api_key", "sk-test123");
      expect(getStoredApiKey("openai")).toBe("sk-test123");
    });

    it("returns claude key", () => {
      localStorageMock.setItem("claude_api_key", "sk-ant-test123");
      expect(getStoredApiKey("claude")).toBe("sk-ant-test123");
    });

    it("uses stored provider when no argument given", () => {
      localStorageMock.setItem("ai_provider", "openai");
      localStorageMock.setItem("openai_api_key", "sk-test123");
      expect(getStoredApiKey()).toBe("sk-test123");
    });

    it("defaults to gemini provider key when no provider stored", () => {
      localStorageMock.setItem("gemini_api_key", "AIzaSyDefault");
      expect(getStoredApiKey()).toBe("AIzaSyDefault");
    });
  });
});
