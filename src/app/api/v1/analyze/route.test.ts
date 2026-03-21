import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import * as db from "@/lib/db";
import { generateText } from "ai";
import * as scraper from "@/services/scraper";
import * as pagespeed from "@/services/pagespeed";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/services/aiModelFactory", () => ({
  createAIModel: vi.fn().mockReturnValue({}),
}));

vi.mock("@/services/scraper", () => ({
  scrapeWebsite: vi.fn(),
}));

vi.mock("@/services/pagespeed", () => ({
  getPageSpeedInsights: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getUserByToken: vi.fn(),
  getSubscription: vi.fn(),
}));

describe("Public API /api/v1/analyze", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (scraper.scrapeWebsite as any).mockResolvedValue("scraped content");
    (pagespeed.getPageSpeedInsights as any).mockResolvedValue({
      performanceScore: 80,
      seoScore: 80,
      accessibilityScore: 80,
      bestPracticesScore: 80,
      lcp: "1s"
    });
  });

  it("returns 401 if token is missing", async () => {
    const req = new Request("http://localhost/api/v1/analyze", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 if user has no active subscription", async () => {
    (db.getUserByToken as any).mockResolvedValue("test@example.com");
    (db.getSubscription as any).mockResolvedValue({ status: "inactive" });

    const req = new Request("http://localhost/api/v1/analyze", {
      method: "POST",
      headers: { "Authorization": "Bearer valid-token" },
      body: JSON.stringify({ link: "http://test.com", businessType: "test", goals: "test" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns audit results for a valid request", async () => {
    (db.getUserByToken as any).mockResolvedValue("test@example.com");
    (db.getSubscription as any).mockResolvedValue({ plan: "pro", status: "active" });
    (generateText as any).mockResolvedValue({
      text: JSON.stringify({ markdownAudit: "Audit text", scores: { communication: 80, aesthetic: 70, drive: 60, structure: 90 } }),
    });

    const req = new Request("http://localhost/api/v1/analyze", {
      method: "POST",
      headers: { "Authorization": "Bearer valid-token" },
      body: JSON.stringify({ link: "http://test.com", businessType: "test", goals: "test goals" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.markdownAudit).toBe("Audit text");
  });
});
