import { describe, it, expect } from "vitest";
import { getRelevantContext } from "./ragService";

describe("Dimensional Inference Engine (ragService)", () => {
  it("returns execution context for growth/conversion queries", () => {
    const context = getRelevantContext("Improve my conversion and sales");
    expect(context).toContain("PROPRIETARY DIMENSIONAL STRATEGY CONTEXT");
    expect(context).toContain("High-Performance CTA Strategy");
  });

  it("returns aesthetic context for design queries", () => {
    const context = getRelevantContext("Better brand look and visual design");
    expect(context).toContain("Visual Harmony Strategy");
  });

  it("calculates coordinates and returns top 3 matches", () => {
    const context = getRelevantContext("Help me with SEO and copy");
    // SEO triggers execution (+25 +30) and communication (+25) terms
    expect(context).toContain("Coordinates:");
    // Should return technically-oriented and communication playbooks
    expect(context).toContain("PROPRIETARY DIMENSIONAL STRATEGY CONTEXT");
  });
});
