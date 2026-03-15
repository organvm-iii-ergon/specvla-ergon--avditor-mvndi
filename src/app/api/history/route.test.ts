import { GET } from "./route";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn(),
}));

import { auth } from "@/auth";
import { getAudits } from "@/lib/db";

const mockAuth = vi.mocked(auth);
const mockGetAudits = vi.mocked(getAudits);

describe("GET /api/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty audits array when not logged in", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ audits: [] });
    expect(response.status).toBe(200);
    expect(mockGetAudits).not.toHaveBeenCalled();
  });

  it("returns audits for logged-in user", async () => {
    const fakeAudits = [
      { id: "1", link: "https://example.com", createdAt: "2026-01-01" },
      { id: "2", link: "https://test.com", createdAt: "2026-01-02" },
    ];
    mockAuth.mockResolvedValue({
      user: { email: "user@example.com" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetAudits.mockResolvedValue(fakeAudits as any);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ audits: fakeAudits });
    expect(response.status).toBe(200);
    expect(mockGetAudits).toHaveBeenCalledWith("user@example.com");
  });

  it("returns 500 on DB error", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "user@example.com" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetAudits.mockRejectedValue(new Error("DB connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "DB connection failed" });
  });
});
