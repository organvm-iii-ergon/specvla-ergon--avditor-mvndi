import { describe, it, expect } from "vitest";
import { createAIModel, type AIProviderType } from "./aiModelFactory";

describe("createAIModel", () => {
  const fakeKey = "test-key-for-unit-test"; // allow-secret

  it("returns a model for gemini provider", () => {
    const model = createAIModel("gemini", fakeKey); // allow-secret
    expect(model).toBeDefined();
    expect(model.modelId).toBe("gemini-1.5-flash");
  });

  it("returns a model for openai provider", () => {
    const model = createAIModel("openai", fakeKey); // allow-secret
    expect(model).toBeDefined();
    expect(model.modelId).toBe("gpt-4o-mini");
  });

  it("returns a model for claude provider", () => {
    const model = createAIModel("claude", fakeKey); // allow-secret
    expect(model).toBeDefined();
    expect(model.modelId).toBe("claude-sonnet-4-20250514");
  });

  it("defaults to gemini for unknown provider", () => {
    const model = createAIModel("unknown" as AIProviderType, fakeKey); // allow-secret
    expect(model).toBeDefined();
    expect(model.modelId).toBe("gemini-1.5-flash");
  });
});
