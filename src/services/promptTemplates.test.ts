import { getCosmicAuditPrompt } from "./promptTemplates";
import { describe, it, expect } from "vitest";
import { PageSpeedResult } from "./pagespeed";

describe("getCosmicAuditPrompt", () => {
  const link = "https://example.com";
  const businessType = "E-commerce";
  const goals = "Increase sales by 50%";
  const scrapedContent = "Welcome to our store. We sell widgets.";

  it("returns a string containing all input parameters", () => {
    const result = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, null);

    expect(result).toContain(link);
    expect(result).toContain(businessType);
    expect(result).toContain(goals);
    expect(result).toContain(scrapedContent);
  });

  it("includes SEO data when provided", () => {
    const seoData: PageSpeedResult = {
      performanceScore: 85,
      seoScore: 92,
      accessibilityScore: 78,
      bestPracticesScore: 90,
      lcp: "2.1s",
    };

    const result = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, seoData);

    expect(result).toContain("Performance Score: 85/100");
    expect(result).toContain("SEO Score: 92/100");
    expect(result).toContain("Accessibility Score: 78/100");
    expect(result).toContain("Best Practices: 90/100");
    expect(result).toContain("Largest Contentful Paint (LCP): 2.1s");
  });

  it("shows fallback text when seoData is null", () => {
    const result = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, null);

    expect(result).toContain("Technical metrics were not available for this site.");
    expect(result).not.toContain("Performance Score:");
  });

  it("includes the JSON schema instructions", () => {
    const result = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, null);

    expect(result).toContain('"markdownAudit"');
    expect(result).toContain('"scores"');
    expect(result).toContain('"communication"');
    expect(result).toContain('"aesthetic"');
    expect(result).toContain('"drive"');
    expect(result).toContain('"structure"');
    expect(result).toContain("You MUST respond with a raw JSON object");
  });
});
