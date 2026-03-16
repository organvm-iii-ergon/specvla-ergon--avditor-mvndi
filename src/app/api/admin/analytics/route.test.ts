import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn(),
  getLeads: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(() => null),
}));

import { GET } from "./route";

describe("GET /api/admin/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/auth");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await GET();
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

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("returns analytics data for admin", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const { getAudits } = await import("@/lib/db");
    vi.mocked(getAudits).mockResolvedValue([
      {
        id: "1",
        userEmail: "user1@test.com",
        link: "https://example.com/page",
        businessType: "SaaS",
        goals: "grow",
        markdownAudit: "audit",
        scores: JSON.stringify({ communication: 80, aesthetic: 70, drive: 90, structure: 60 }),
        createdAt: now.toISOString(),
      },
      {
        id: "2",
        userEmail: "user2@test.com",
        link: "https://another.com",
        businessType: "E-commerce",
        goals: "scale",
        markdownAudit: "audit2",
        scores: JSON.stringify({ communication: 60, aesthetic: 50, drive: 70, structure: 80 }),
        createdAt: now.toISOString(),
      },
      {
        id: "3",
        userEmail: "user3@test.com",
        link: "https://example.com/other",
        businessType: "SaaS",
        goals: "leads",
        markdownAudit: "audit3",
        scores: JSON.stringify({ communication: 90, aesthetic: 80, drive: 60, structure: 70 }),
        createdAt: now.toISOString(),
      },
    ]);

    const { getLeads } = await import("@/lib/db");
    vi.mocked(getLeads).mockResolvedValue([
      {
        id: "lead-1",
        email: "lead@test.com",
        auditId: "1",
        source: "audit_gate",
        createdAt: now.toISOString(),
      },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);

    // Audit volume by day
    expect(data.auditsByDay).toHaveLength(30);
    const todayEntry = data.auditsByDay.find((d: { date: string }) => d.date === today);
    expect(todayEntry?.count).toBe(3);

    // Top domains
    expect(data.topDomains).toHaveLength(2);
    expect(data.topDomains[0].domain).toBe("example.com");
    expect(data.topDomains[0].count).toBe(2);
    expect(data.topDomains[1].domain).toBe("another.com");
    expect(data.topDomains[1].count).toBe(1);

    // Average scores: (80+60+90)/3=76.7, (70+50+80)/3=66.7, (90+70+60)/3=73.3, (60+80+70)/3=70
    expect(data.avgScores.communication).toBeCloseTo(76.7, 0);
    expect(data.avgScores.aesthetic).toBeCloseTo(66.7, 0);
    expect(data.avgScores.drive).toBeCloseTo(73.3, 0);
    expect(data.avgScores.structure).toBeCloseTo(70, 0);

    // Business types
    expect(data.businessTypes).toHaveLength(2);
    expect(data.businessTypes[0]).toEqual({ type: "SaaS", count: 2 });
    expect(data.businessTypes[1]).toEqual({ type: "E-commerce", count: 1 });

    // Lead funnel
    expect(data.leadsByDay).toHaveLength(30);
    const todayLeads = data.leadsByDay.find((d: { date: string }) => d.date === today);
    expect(todayLeads?.count).toBe(1);
    expect(data.totalLeads).toBe(1);
    expect(data.conversionRate).toBeCloseTo(33.3, 0);
  });

  it("handles empty data", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { getAudits } = await import("@/lib/db");
    vi.mocked(getAudits).mockResolvedValue([]);

    const { getLeads } = await import("@/lib/db");
    vi.mocked(getLeads).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.auditsByDay).toHaveLength(30);
    expect(data.topDomains).toHaveLength(0);
    expect(data.avgScores).toEqual({ communication: 0, aesthetic: 0, drive: 0, structure: 0 });
    expect(data.businessTypes).toHaveLength(0);
    expect(data.totalLeads).toBe(0);
    expect(data.conversionRate).toBe(0);
  });
});
