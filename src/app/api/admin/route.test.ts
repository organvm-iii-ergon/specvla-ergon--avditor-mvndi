import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn(),
}));

import { GET } from "./route";

function makeRequest(type?: string): Request {
  const url = type
    ? `http://localhost:3000/api/admin?type=${type}`
    : "http://localhost:3000/api/admin";
  return new Request(url, { method: "GET" });
}

describe("GET /api/admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await GET(makeRequest("stats"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 when not admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { email: "nobody@example.com", name: "Nobody" },
      expires: "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await GET(makeRequest("stats"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("returns stats for type=stats", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { getAudits } = await import("@/lib/db");
    vi.mocked(getAudits).mockResolvedValue([
      {
        id: "1",
        userEmail: "user1@test.com",
        link: "test.com",
        businessType: "SaaS",
        goals: "grow",
        markdownAudit: "audit",
        scores: "{}",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        userEmail: "user2@test.com",
        link: "test2.com",
        businessType: "ecom",
        goals: "scale",
        markdownAudit: "audit2",
        scores: "{}",
        createdAt: new Date().toISOString(),
      },
    ]);

    const res = await GET(makeRequest("stats"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.totalAudits).toBe(2);
    expect(data.totalUsers).toBe(2);
    expect(data.auditsLast30Days).toBe(2);
  });

  it("returns audits list for type=audits", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { getAudits } = await import("@/lib/db");
    vi.mocked(getAudits).mockResolvedValue([
      {
        id: "1",
        userEmail: "user1@test.com",
        link: "test.com",
        businessType: "SaaS",
        goals: "grow",
        markdownAudit: "audit",
        scores: "{}",
        createdAt: "2026-03-01T00:00:00Z",
      },
    ]);

    const res = await GET(makeRequest("audits"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.totalAudits).toBe(1);
    expect(data.uniqueUsers).toHaveLength(1);
    expect(data.uniqueUsers[0].email).toBe("user1@test.com");
    expect(data.uniqueUsers[0].auditCount).toBe(1);
    expect(data.recentAudits).toHaveLength(1);
  });

  it("returns 400 for invalid type", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await GET(makeRequest("invalid"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid type parameter");
  });
});
