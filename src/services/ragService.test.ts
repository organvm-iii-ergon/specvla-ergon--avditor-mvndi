import { describe, it, expect } from "vitest";
import { getRelevantContext } from "./ragService";

describe("rag service", () => {
  it("returns context if keywords match", () => {
    const context = getRelevantContext("Improve my conversion and CTA buttons");
    expect(context).toContain("PROPRIETARY STRATEGY CONTEXT");
    expect(context).toContain("Mars energy requires direct movement");
  });

  it("returns empty string if no keywords match", () => {
    const context = getRelevantContext("Something unrelated to marketing");
    expect(context).toBe("");
  });

  it("aggregates multiple matches", () => {
    const context = getRelevantContext("Improve my SEO and Design");
    expect(context).toContain("Saturn rules structure");
    expect(context).toContain("Venus demands beauty");
  });
});
