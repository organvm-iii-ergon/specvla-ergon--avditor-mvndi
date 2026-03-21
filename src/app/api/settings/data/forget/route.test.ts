import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";
import * as db from "@/lib/db";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  deleteUserData: vi.fn(),
}));

describe("Data Forget API", () => {
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue({ user: { email: mockEmail } });
  });

  it("calls deleteUserData and returns success", async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(db.deleteUserData).toHaveBeenCalledWith(mockEmail);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 401 if unauthorized", async () => {
    (auth as any).mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });
});
