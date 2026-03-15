import { GET } from "./route";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  getAuditById: vi.fn(),
}));

import { getAuditById } from "@/lib/db";

const mockGetAuditById = vi.mocked(getAuditById);

describe("GET /api/share/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns audit data for valid ID", async () => {
    const fakeAudit = {
      id: "test-id",
      link: "https://example.com",
      businessType: "SaaS",
      goals: "Increase conversions",
      markdownAudit: "# Audit Report",
      scores: '{"communication":80,"aesthetic":70,"drive":90,"structure":85}',
      createdAt: "2026-01-01T00:00:00Z",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetAuditById.mockResolvedValue(fakeAudit as any);

    const response = await GET(
      new Request("http://localhost/api/share/test-id"),
      { params: Promise.resolve({ id: "test-id" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: "test-id",
      link: "https://example.com",
      businessType: "SaaS",
      goals: "Increase conversions",
      markdownAudit: "# Audit Report",
      scores: { communication: 80, aesthetic: 70, drive: 90, structure: 85 },
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(mockGetAuditById).toHaveBeenCalledWith("test-id");
  });

  it("returns 404 for non-existent audit", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetAuditById.mockResolvedValue(null as any);

    const response = await GET(
      new Request("http://localhost/api/share/missing-id"),
      { params: Promise.resolve({ id: "missing-id" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: "Audit not found" });
  });

  it("returns 500 on error", async () => {
    mockGetAuditById.mockRejectedValue(new Error("Database failure"));

    const response = await GET(
      new Request("http://localhost/api/share/err-id"),
      { params: Promise.resolve({ id: "err-id" }) }
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Database failure" });
  });
});
