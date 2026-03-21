import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import * as db from "@/lib/db";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn().mockResolvedValue([]),
  getScheduledAudits: vi.fn().mockResolvedValue([]),
  getIntegrations: vi.fn().mockResolvedValue([]),
}));

describe("Data Export API", () => {
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue({ user: { email: mockEmail } });
  });

  it("returns a JSON file download", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toContain(`growth-auditor-data-${mockEmail}.json`);
    
    const data = await res.json();
    expect(data.user.email).toBe(mockEmail);
    expect(data).toHaveProperty("exportedAt");
  });

  it("returns 401 if unauthorized", async () => {
    (auth as any).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
