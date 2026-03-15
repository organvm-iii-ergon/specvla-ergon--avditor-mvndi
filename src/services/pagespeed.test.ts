import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPageSpeedInsights } from "./pagespeed";

global.fetch = vi.fn();

describe("pagespeed service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns null if API returns error", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: "Too Many Requests",
    });

    const result = await getPageSpeedInsights("test.com");
    expect(result).toBeNull();
  });

  it("parses PageSpeed API response correctly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        lighthouseResult: {
          categories: {
            performance: { score: 0.85 },
            seo: { score: 0.92 },
            accessibility: { score: 0.78 },
            "best-practices": { score: 0.88 },
          },
          audits: {
            "largest-contentful-paint": { displayValue: "2.4s" },
          },
        },
      }),
    });

    const result = await getPageSpeedInsights("test.com");
    
    expect(result).toEqual({
      performanceScore: 85,
      seoScore: 92,
      accessibilityScore: 78,
      bestPracticesScore: 88,
      lcp: "2.4s",
    });
  });

  it("handles missing data gracefully", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const result = await getPageSpeedInsights("test.com");
    
    expect(result).toEqual({
      performanceScore: 0,
      seoScore: 0,
      accessibilityScore: 0,
      bestPracticesScore: 0,
      lcp: "N/A",
    });
  });
});
