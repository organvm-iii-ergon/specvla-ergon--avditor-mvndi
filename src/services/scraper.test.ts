import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeWebsite } from "./scraper";

global.fetch = vi.fn();

describe("scraper service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty string if fetch fails", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    });

    const result = await scrapeWebsite("test.com");
    expect(result).toBe("");
  });

  it("returns content from successful fetch", async () => {
    const html = `
      <html>
        <title>Test Title</title>
        <meta name="description" content="Test description">
        <h1>Main Heading</h1>
        <h2>Sub Heading</h2>
        <p>This is a paragraph with enough content to be included.</p>
      </html>
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    });

    const result = await scrapeWebsite("test.com");
    
    expect(result).toContain("Test Title");
    expect(result).toContain("Test description");
    expect(result).toContain("Main Heading");
    expect(result).toContain("Sub Heading");
    expect(result).toContain("paragraph");
  });

  it("handles fetch errors gracefully", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const result = await scrapeWebsite("test.com");
    expect(result).toBe("");
  });

  it("adds https:// if missing from URL", async () => {
    const html = `<html><title>Test</title></html>`;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => html,
    });

    await scrapeWebsite("test.com");
    
    expect(global.fetch).toHaveBeenCalledWith(
      "https://test.com",
      expect.any(Object)
    );
  });
});
