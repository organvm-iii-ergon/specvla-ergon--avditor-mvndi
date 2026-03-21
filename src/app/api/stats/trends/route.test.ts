import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn(),
}));

import { GET } from "./route";
import { auth } from "@/auth";
import { getAudits } from "@/lib/db";

const mockAuth = vi.mocked(auth);
const mockGetAudits = vi.mocked(getAudits);

function makeRequest(search = ""): Request {
  return new Request(`http://localhost:3000/api/stats/trends${search}`, {
    method: "GET",
  });
}

describe("GET /api/stats/trends", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);

    const res = await GET(makeRequest("?link=https://example.com"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when link parameter is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "user@example.com", name: "User" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await GET(makeRequest());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Link parameter is required");
  });

  it("returns empty array when user has no audits for the given link", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "user@example.com", name: "User" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetAudits.mockResolvedValue([]);

    const res = await GET(makeRequest("?link=https://example.com"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockGetAudits).toHaveBeenCalledWith("user@example.com");
  });

  it("returns trend data sorted by date for a valid request", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "user@example.com", name: "User" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetAudits.mockResolvedValue([
      {
        id: "audit-1",
        userEmail: "user@example.com",
        link: "https://example.com",
        businessType: "SaaS",
        goals: "grow",
        markdownAudit: "first audit",
        scores: JSON.stringify({ communication: 70, aesthetic: 65, drive: 60, structure: 75 }),
        createdAt: "2026-02-01T00:00:00Z",
      },
      {
        id: "audit-2",
        userEmail: "user@example.com",
        link: "https://example.com",
        businessType: "SaaS",
        goals: "grow",
        markdownAudit: "second audit",
        scores: JSON.stringify({ communication: 80, aesthetic: 75, drive: 70, structure: 85 }),
        createdAt: "2026-03-01T00:00:00Z",
      },
      // Different link — should be filtered out
      {
        id: "audit-3",
        userEmail: "user@example.com",
        link: "https://other.com",
        businessType: "Agency",
        goals: "leads",
        markdownAudit: "other audit",
        scores: JSON.stringify({ communication: 50, aesthetic: 50, drive: 50, structure: 50 }),
        createdAt: "2026-03-10T00:00:00Z",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    const res = await GET(makeRequest("?link=https://example.com"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);

    // Should be sorted oldest first
    expect(new Date(data[0].date).getTime()).toBeLessThan(new Date(data[1].date).getTime());

    expect(data[0].scores.communication).toBe(70);
    expect(data[1].scores.communication).toBe(80);
  });

  it("returns 500 when db throws an error", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "user@example.com", name: "User" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetAudits.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest("?link=https://example.com"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to fetch trends");
  });
});
