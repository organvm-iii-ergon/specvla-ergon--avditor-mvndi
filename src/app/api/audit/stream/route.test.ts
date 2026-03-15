import { POST } from "./route";
import { describe, it, expect, vi } from "vitest";

const mockStreamText = vi.fn().mockReturnValue({
  toTextStreamResponse: () =>
    new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("# Audit\n\nSome content\n\n## Scores\n- Communication: 90\n- Aesthetic: 80\n- Drive: 70\n- Structure: 85\n"));
        controller.close();
      },
    }), { headers: { "Content-Type": "text/plain; charset=utf-8" } }),
});

vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn().mockReturnValue(
    vi.fn().mockReturnValue("mock-model")
  ),
}));

vi.mock("@/services/scraper", () => ({
  scrapeWebsite: vi.fn().mockResolvedValue("Mocked scraped content"),
}));

vi.mock("@/services/vision", () => ({
  captureScreenshot: vi.fn().mockResolvedValue("base64mockscreenshot"),
}));

vi.mock("@/services/pagespeed", () => ({
  getPageSpeedInsights: vi.fn().mockResolvedValue({
    performanceScore: 85,
    seoScore: 90,
    accessibilityScore: 78,
    bestPracticesScore: 88,
    lcp: "2.4s",
  }),
}));

vi.mock("@/lib/db", () => ({
  saveAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { email: "test@example.com", name: "Test User" } }),
}));

describe("API Route /api/audit/stream", () => {
  it("returns 401 if Authorization header is missing", async () => {
    const request = new Request("http://localhost/api/audit/stream", {
      method: "POST",
      body: JSON.stringify({
        link: "test.com",
        businessType: "test",
        goals: "test",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Missing or invalid Authorization header");
  });

  it("returns 400 if required fields are missing", async () => {
    const request = new Request("http://localhost/api/audit/stream", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-key",
      },
      body: JSON.stringify({
        link: "test.com",
        // Missing businessType and goals
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("returns a streaming response for valid input", async () => {
    const request = new Request("http://localhost/api/audit/stream", {
      method: "POST",
      headers: {
        Authorization: "Bearer valid-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        link: "test.com",
        businessType: "test",
        goals: "test",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(ReadableStream);

    // Read the stream to verify content
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }

    expect(fullText).toContain("# Audit");
    expect(fullText).toContain("## Scores");
    expect(mockStreamText).toHaveBeenCalled();
  });
});
